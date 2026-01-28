"""
DAG pour supprimer tous les datasets de data.gouv.fr.

Ce DAG récupère tous les datasets de l'organisation sur data.gouv.fr
et les supprime.
"""

import pendulum
from include.container import DomainContainer as Container

from airflow.decorators import dag, task


@dag(
    dag_id="archive_all_from_data_gouv",
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    max_active_tasks=10,
    tags=["data_gouv", "archive"],
)
def archive_all_from_data_gouv():
    @task.python
    def get_all_dataset_ids() -> list[str]:
        """Récupère tous les IDs de datasets depuis data.gouv.fr."""
        datasets = Container().data_gouv().get_organization_datasets()
        return [ds["id"] for ds in datasets]

    @task.python
    def delete_dataset(dataset_id: str) -> str:
        """Supprime un dataset de data.gouv.fr."""
        Container().data_gouv().delete_dataset(dataset_id)
        return dataset_id

    dataset_ids = get_all_dataset_ids()
    delete_dataset.expand(dataset_id=dataset_ids)


archive_all_from_data_gouv()
