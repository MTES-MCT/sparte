"""

Ce dag permet d'exécuter des commandes dbt.

"""

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
    "dbt_selector_dag",
    default_args=default_args,
    description="Exécute des commandes DBT avec un sélecteur",
    schedule_interval=None,
    start_date=datetime(2024, 1, 1),
    catchup=False,
    params={
        "select": Param(default="default", type="string", description="Sélecteur DBT à utiliser pour l'exécution"),
        "command": Param(
            default="build",
            type="string",
            description="Commande DBT à exécuter (build, run, test, etc.)",
            enum=["build", "run", "test", "compile", "debug", "deps", "clean"],
        ),
    },
) as dag:
    # Validation du sélecteur
    validate_selector = BashOperator(
        task_id="validate_selector",
        bash_command=get_dbt_command_from_directory("dbt ls --select {{ params.select }} || exit 1"),
    )

    # Exécution de dbt avec le sélecteur
    execute_dbt = BashOperator(
        task_id="execute_dbt",
        bash_command=get_dbt_command_from_directory("dbt {{ params.command }} --select {{ params.select }}"),
    )

    validate_selector >> execute_dbt
