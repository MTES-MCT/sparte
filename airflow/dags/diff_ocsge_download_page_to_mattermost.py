import difflib

import requests
from airflow.decorators import dag, task
from bs4 import BeautifulSoup
from include.container import Container
from pendulum import datetime


# Define the basic parameters of the DAG, like schedule and start_date
@dag(
    start_date=datetime(2024, 1, 1),
    schedule="0 10 * * *",
    catchup=False,
    doc_md=__doc__,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["App"],
)
def diff_ocsge_download_page_to_mattermost():
    @task.python
    def diff():
        url = "https://geoservices.ign.fr/ocsge#telechargement"
        selector = "#block-ignpro-content > div > article > div.container > div:nth-child(2) > div > div > div.field--items > div:nth-child(2)"  # noqa: E501
        s3_path = "airflow-staging/download_page_ocsge.txt"
        local_path = "download_page_ocsge.txt"

        if Container().s3().exists(s3_path):
            Container().s3().get_file(s3_path, local_path)
            with open(local_path, "r") as f:
                previous_txt = f.read()
        else:
            previous_txt = ""

        new_html = requests.get(url).text
        new_soup = BeautifulSoup(new_html, features="html.parser")
        new_txt = new_soup.select(selector)[0].text.strip()

        diff = difflib.unified_diff(previous_txt.splitlines(), new_txt.splitlines())

        with open(local_path, "w") as f:
            f.write(new_txt)

        Container().s3().put_file(local_path, s3_path)

        diff_str = "\n".join(diff)

        if diff_str:
            markdown_message = "\n".join(
                [
                    "```",
                    diff_str,
                    "```",
                ]
            )
            Container().mattermost().send(markdown_message)

    diff()


# Instantiate the DAG
diff_ocsge_download_page_to_mattermost()
