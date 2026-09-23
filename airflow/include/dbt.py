"""
Point d'entrée unique pour exécuter dbt depuis Airflow.

On passe par les opérateurs Cosmos plutôt que par des commandes shell : la
commande est construite comme une liste d'arguments, jamais interpolée dans un
shell, et la configuration projet/profil est définie ici une seule fois.
"""

import os
from pathlib import Path
from typing import Callable

from cosmos import ProfileConfig
from cosmos.operators.local import DbtBuildLocalOperator
from include.pools import DBT_POOL

from airflow.exceptions import AirflowSkipException

DBT_PROJECT_DIR = Path(os.environ["AIRFLOW_HOME"]) / "include" / "sql" / "sparte"

PROFILE_CONFIG = ProfileConfig(
    profile_name="sparte",
    target_name="dev",
    profiles_yml_filepath=Path.home() / ".dbt" / "profiles.yml",
)

# Les modèles taggés `macro_unit_test` n'existent que pour les tests unitaires de
# macros : leurs colonnes ne correspondent pas aux vraies tables.
DEFAULT_EXCLUDE = ["tag:macro_unit_test"]


class DbtBuild(DbtBuildLocalOperator):
    """
    `dbt build` avec la configuration sparte déjà câblée.

    En plus de l'opérateur Cosmos :
    - `skip_if_param` / `run_if_param` : nom d'un param booléen du dag qui
      décide si l'étape doit être jouée. La task est alors *skipped*, et non
      exécutée à vide.
    - `select_callable` : calcule les sélecteurs au moment de l'exécution, pour
      les dags dont la cible dépend des params du run.
    """

    def __init__(
        self,
        *,
        task_id: str = "dbt_build",
        select: list[str] | None = None,
        exclude: list[str] | None = None,
        select_callable: Callable[[dict], list[str]] | None = None,
        skip_if_param: str | None = None,
        run_if_param: str | None = None,
        **kwargs,
    ):
        self.select_callable = select_callable
        self.skip_if_param = skip_if_param
        self.run_if_param = run_if_param

        kwargs.setdefault("pool", DBT_POOL)
        kwargs.setdefault("install_deps", False)

        super().__init__(
            task_id=task_id,
            project_dir=DBT_PROJECT_DIR,
            profile_config=PROFILE_CONFIG,
            select=select or [],
            exclude=exclude if exclude is not None else DEFAULT_EXCLUDE,
            **kwargs,
        )

    def pre_execute(self, context):
        """
        Le skip et le calcul des sélecteurs se font ici, pas dans `execute`.

        `execute` est enveloppé par ExecutorSafeguard, qui mémorise sa sentinelle
        sous le nom de la classe appelante : un `super().execute()` depuis une
        sous-classe la cherche sous le nom de la classe parente, ne la trouve pas,
        et journalise « cannot be called outside TaskInstance ». `pre_execute` n'est
        pas enveloppé et le TaskInstance l'appelle juste avant `execute`.
        """
        params = context.get("params") or {}

        if self.skip_if_param and params.get(self.skip_if_param):
            raise AirflowSkipException(f"`{self.skip_if_param}` est actif : build dbt ignoré.")

        if self.run_if_param and not params.get(self.run_if_param):
            raise AirflowSkipException(f"`{self.run_if_param}` est désactivé : build dbt ignoré.")

        if self.select_callable:
            self.select = self.select_callable(context)

        return super().pre_execute(context)
