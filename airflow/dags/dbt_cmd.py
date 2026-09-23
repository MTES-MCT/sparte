"""
Ce dag exécute un `dbt build` sur le projet sparte.

La commande n'est jamais assemblée en chaîne shell : Cosmos construit lui-même
l'argv à partir de paramètres typés, validés par Airflow au déclenchement.

`dbt build` couvre `run`, `test`, `seed` et `snapshot` en une passe, en
respectant l'ordre du graphe : une seule sous-commande suffit ici.
"""

from datetime import datetime, timedelta

from include.dbt import DbtBuild

from airflow.decorators import dag
from airflow.models.param import Param

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "email_on_failure": True,
    "email_on_retry": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}


@dag(
    "dbt_build",
    default_args=default_args,
    description="Exécute un dbt build sur le projet sparte",
    schedule_interval=None,
    start_date=datetime(2024, 1, 1),
    catchup=False,
    # Les params `array` doivent arriver à Cosmos comme de vraies listes Python,
    # pas comme leur repr string : sans ça `--select` recevrait "['land_details']".
    render_template_as_native_obj=True,
    params={
        "select": Param(
            default=[],
            type="array",
            items={"type": "string"},
            description=(
                "Sélecteurs dbt passés à `--select`. Liste vide = tout le projet. "
                "Exemple : `seed_land_non_diagnosticable+`"
            ),
        ),
        "exclude": Param(
            default=["tag:macro_unit_test"],
            type="array",
            items={"type": "string"},
            description=(
                "Sélecteurs dbt passés à `--exclude`. Les modèles taggés `macro_unit_test` "
                "n'existent que pour les tests unitaires de macros : leurs colonnes ne "
                "correspondent pas aux vraies tables, il faut donc garder "
                "`tag:macro_unit_test` sur tout build."
            ),
        ),
        "full_refresh": Param(
            default=False,
            type="boolean",
            description="Ajoute `--full-refresh`.",
        ),
    },
)
def dbt_build():
    DbtBuild(
        task_id="execute_dbt",
        select="{{ params.select }}",
        exclude="{{ params.exclude }}",
        full_refresh="{{ params.full_refresh }}",
    )


dbt_build()
