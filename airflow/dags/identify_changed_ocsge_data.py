import json

import requests
from airflow.decorators import dag, task
from bs4 import BeautifulSoup
from include.container import Container
from pendulum import datetime

with open("include/ocsge/sources.json", "r") as f:
    sources = json.load(f)


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="0 10 * * *",  # every day at 10:00
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["OCS GE"],
)
def identify_changed_ocsge_data():
    @task.python
    def check_for_missing_urls():
        url = "https://geoservices.ign.fr/ocsge#telechargement"
        selector = "a"  # noqa: E501

        new_html = requests.get(url).text
        new_soup = BeautifulSoup(new_html, features="html.parser")
        links = new_soup.select(selector)
        current_urls = [link.get("href") for link in links]

        missing_urls = []

        for departement in sources:
            difference: dict[str, str] = sources[departement]["difference"]
            occupation_du_sol_et_zone_construite: dict[str, str] = sources[departement][
                "occupation_du_sol_et_zone_construite"
            ]

            for year_pair, url in difference.items():
                if url not in current_urls:
                    missing_urls.append(
                        {"departement": departement, "years": year_pair, "type": "difference", "url": url}
                    )

            for year, url in occupation_du_sol_et_zone_construite.items():
                if url not in current_urls:
                    missing_urls.append(
                        {
                            "departement": departement,
                            "years": year,
                            "type": "occupation_du_sol_et_zone_construite",
                            "url": url,
                        }
                    )

        if missing_urls:
            markdown_message = "⚠️ Changement d'url des données OCS GE détecté\n"
            for url in missing_urls:
                markdown_message += "```\n"
                markdown_message += f"Departement : {url['departement']}\n"
                markdown_message += f"Années : {url['years']}\n"
                markdown_message += f"Type : {url['type']}\n"
                markdown_message += f"Url manquant : {url['url']}\n"
                markdown_message += "```\n"
            Container().mattermost().send(markdown_message)

    check_for_missing_urls()


identify_changed_ocsge_data()
