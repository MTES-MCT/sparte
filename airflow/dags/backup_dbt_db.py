from datetime import datetime, timedelta
from os import getenv

from include.container import Container

from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator

default_args = {
    "owner": "Alexis Athlani",
    "depends_on_past": False,
    "email_on_failure": True,
    "email_on_retry": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}

DB_HOST = getenv("DBT_DB_HOST")
DB_PORT = getenv("DBT_DB_PORT")
DB_NAME = getenv("DBT_DB_NAME")
DB_USER = getenv("DBT_DB_USER")
DB_PASSWORD = getenv("DBT_DB_PASSWORD")


def upload_to_s3(local_file: str, s3_file: str) -> str:
    bucket_name = "airflow-staging"
    path_on_bucket = f"{bucket_name}/{s3_file}"

    s3 = Container().s3()
    s3.put(local_file, path_on_bucket)

    print(f"Upload réussi : {path_on_bucket}")
    return path_on_bucket


with DAG(
    "backup_dbt_staging_db",
    default_args=default_args,
    description="Sauvegarde hebdomadaire de la base staging DBT vers S3",
    schedule_interval="0 1 * * 0",  # Tous les dimanches à 1h du matin
    start_date=datetime(2024, 1, 1),
    catchup=False,
) as dag:
    backup_date = "{{ ds_nodash }}"
    backup_filename = f"{DB_NAME}_backup_{backup_date}.dump"
    backup_path = f"/tmp/{backup_filename}"

    create_backup = BashOperator(
        task_id="create_backup",
        bash_command=f'PGPASSWORD="{DB_PASSWORD}" pg_dump -Fc -O -h {DB_HOST} -p {DB_PORT} -U {DB_USER} -d {DB_NAME} > {backup_path}',  # noqa E501
    )

    upload_backup = PythonOperator(
        task_id="upload_to_s3",
        python_callable=upload_to_s3,
        op_kwargs={"local_file": backup_path, "s3_file": f"backup/{DB_NAME}/{backup_filename}"},
    )

    cleanup = BashOperator(
        task_id="cleanup",
        bash_command=f"rm {backup_path}",
    )

    create_backup >> upload_backup >> cleanup
