"""
Ce dag compare le contenu de la page de téléchargement de l'IGN OCS GE
et envoie un message sur Mattermost en cas de différence.
"""

import difflib
from logging import getLogger

import requests
from bs4 import BeautifulSoup
from include.domain.container import Container
from pendulum import datetime

from airflow.decorators import dag, task
from airflow.exceptions import AirflowSkipException

logger = getLogger(__name__)


def get_feed_by_page(page: int):
    feed_url = f"https://data.geopf.fr/telechargement/resource/OCSGE?limit=50&page={page}"
    feed = requests.get(feed_url)
    return feed.text


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="0 10 * * *",  # every day at 10:00
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["OCS GE"],
)
def diff_ocsge_download_page_to_mattermost():
    @task.python
    def download_feed():
        feed = get_feed_by_page(1)
        soup = BeautifulSoup(feed, features="xml")

        page_count = int(soup.select("feed")[0]["gpf_dl:pagecount"])
        entry_count = soup.select("feed")[0]["gpf_dl:totalentries"]

        logger.info(f"Found {entry_count} entries in {page_count} pages")

        feed_as_string = ""

        dict_entries = []

        for page in range(1, page_count + 1):
            logger.info(f"Downloading page {page}")
            feed = get_feed_by_page(page)
            soup = BeautifulSoup(feed, features="xml")
            entries = soup.select("entry")
            for entry in entries:
                updated = entry.find("updated").text
                link = entry.find("link")["href"]
                departement = entry.find("gpf_dl:zone")["label"]
                _format = entry.find("gpf_dl:format")["label"]
                dict_entries.append(
                    {
                        "departement": departement,
                        "link": link,
                        "format": _format,
                        "updated": updated,
                    }
                )

        dict_entries.sort(key=lambda x: x.get("departement"))

        for entry in dict_entries:
            feed_as_string += entry.get("departement") + "\n"
            feed_as_string += entry.get("link") + "\n"
            feed_as_string += entry.get("format") + "\n"
            feed_as_string += entry.get("updated") + "\n\n"

        return feed_as_string

    @task.python
    def generate_diff(current_feed: str) -> str:
        s3_path = "airflow-staging/simplified_ocsge_atom_feed.txt"
        local_path = "simplified_ocsge_atom_feed.txt"

        if Container().s3().exists(s3_path):
            Container().s3().get_file(s3_path, local_path)
            with open(local_path, "r") as f:
                previous_feed = f.read()
        else:
            previous_feed = ""

        diff = difflib.unified_diff(a=previous_feed.splitlines(), b=current_feed.splitlines())

        with open(local_path, "w") as f:
            f.write(current_feed)

        Container().s3().put_file(local_path, s3_path)

        return "\n".join(diff)

    @task.python
    def send_diff_to_mattermost(diff_str: str):
        if diff_str:
            markdown_message = "\n".join(
                [
                    "```",
                    diff_str,
                    "```",
                ]
            )
            Container().notification().send(message=markdown_message)
        else:
            raise AirflowSkipException("No difference found")

    current_feed = download_feed()
    diff_str = generate_diff(current_feed)
    send_diff_to_mattermost(diff_str)


diff_ocsge_download_page_to_mattermost()
