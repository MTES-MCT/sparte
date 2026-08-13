from datetime import datetime, timedelta

from include.pools import DBT_POOL
from include.utils import get_dbt_command_from_directory

from airflow import DAG
from airflow.models.param import Param
from airflow.operators.bash import BashOperator

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
            default="dbt build -s --exclude tag:macro_unit_test",
            type="string",
            description=(
                "Les modèles taggés `macro_unit_test` n'existent que pour les tests unitaires "
                "de macros : leurs colonnes ne correspondent pas aux vraies tables, il faut donc "
                "garder `--exclude tag:macro_unit_test` sur tout build."
            ),
        ),
    },
) as dag:
    execute_dbt = BashOperator(
        task_id="execute_dbt",
        bash_command=get_dbt_command_from_directory("{{ params.command }}"),
        pool=DBT_POOL,
    )

    execute_dbt
