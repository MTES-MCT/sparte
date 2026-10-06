import os
import shutil
import subprocess
from datetime import datetime, timedelta
from os import getenv

from include.container import InfraContainer as Container

from airflow import DAG
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


def backup_to_s3(s3_file: str) -> str:
    """
    Streame la sortie de pg_dump directement vers S3 : aucun fichier n'est écrit
    sur le disque local, la tâche peut donc tourner dans n'importe quel pod.
    """
    bucket_name = Container().bucket_name()
    path_on_bucket = f"{bucket_name}/{s3_file}"

    command = ["pg_dump", "-Fc", "-O", "-h", DB_HOST, "-p", DB_PORT, "-U", DB_USER, "-d", DB_NAME]
    env = {**os.environ, "PGPASSWORD": DB_PASSWORD}

    s3 = Container().s3()
    with subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env) as process:
        with s3.open(path_on_bucket, "wb") as remote_file:
            shutil.copyfileobj(process.stdout, remote_file)
        stderr = process.stderr.read().decode()
        returncode = process.wait()

    if returncode != 0:
        # Ne pas laisser un dump tronqué sur le bucket
        s3.rm(path_on_bucket)
        raise RuntimeError(f"pg_dump a échoué (code {returncode}) : {stderr}")

    print(f"Upload réussi : {path_on_bucket}")
    return path_on_bucket


with DAG(
    "backup_dbt_db",
    default_args=default_args,
    description="Sauvegarde hebdomadaire de la base staging DBT vers S3",
    schedule_interval="0 1 * * 0",  # Tous les dimanches à 1h du matin
    start_date=datetime(2024, 1, 1),
    catchup=False,
) as dag:
    backup_date = "{{ ds_nodash }}"
    backup_filename = f"{DB_NAME}_backup_{backup_date}.dump"

    PythonOperator(
        task_id="backup_to_s3",
        python_callable=backup_to_s3,
        op_kwargs={"s3_file": f"backup/{DB_NAME}/{backup_filename}"},
    )
