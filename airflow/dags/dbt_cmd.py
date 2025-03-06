from datetime import datetime, timedelta

from airflow.models.param import Param
from airflow.operators.bash import BashOperator
from include.utils import get_dbt_command_from_directory

from airflow import DAG

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "email_on_failure": True,
    "email_on_retry": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    "dbt_build",
    default_args=default_args,
    description="Exécute des commandes DBT",
    schedule_interval=None,
    start_date=datetime(2024, 1, 1),
    catchup=False,
    params={
        "command": Param(
            default="dbt build -s",
            type="string",
        ),
    },
) as dag:
    execute_dbt = BashOperator(
        task_id="execute_dbt",
        bash_command=get_dbt_command_from_directory("{{ params.command }}"),
    )

    execute_dbt
