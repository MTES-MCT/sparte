from airflow.decorators import dag, task
from include.domain.container import Container
from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory
from pendulum import datetime


@dag(
    start_date=datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 3},
    tags=["ZLV"],
)
def ingest_zlv():
    bucket_name = "airflow-staging"
    file_to_table_map = [
        {
            "filename": "ZLV_parcs_2019.csv",
            "table_name": "zlv_parcs_2019",
        },
        {
            "filename": "ZLV_parcs_2020.csv",
            "table_name": "zlv_parcs_2020",
        },
        {
            "filename": "ZLV_parcs_2021.csv",
            "table_name": "zlv_parcs_2021",
        },
        {
            "filename": "ZLV_parcs_2022.csv",
            "table_name": "zlv_parcs_2022",
        },
        {
            "filename": "ZLV_parcs_2023.csv",
            "table_name": "zlv_parcs_2023",
        },
        {
            "filename": "ZLV_parcs_2024.csv",
            "table_name": "zlv_parcs_2024",
        },
    ]

    @task.python
    def ingest() -> int | None:
        for file_to_table in file_to_table_map:
            (
                Container()
                .s3_csv_file_to_db_table_handler()
                .ingest_s3_csv_file_to_db_table(
                    s3_bucket=bucket_name,
                    s3_key=file_to_table["filename"],
                    table_name=file_to_table["table_name"],
                    separator=",",
                )
            )

    @task.bash(retries=0, trigger_rule="all_success", pool=DBT_POOL)
    def dbt_build():
        return get_dbt_command_from_directory(cmd="dbt build -s zlv")

    ingest() >> dbt_build()


ingest_zlv()
