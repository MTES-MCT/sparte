"""
Teste le skip conditionnel de l'opérateur `DbtBuild`.

La décision est prise dans `pre_execute`, que le TaskInstance appelle juste avant
`execute`. On l'appelle donc directement : Cosmos ne surcharge pas ce hook, et
aucune commande dbt n'est lancée.
"""

from types import SimpleNamespace

import pytest
from include.dbt import DbtBuild

from airflow.exceptions import AirflowSkipException


def make_context(params):
    """
    Contexte minimal accepté par `pre_execute`.

    Airflow enveloppe `pre_execute` avec `prepare_lineage`, qui résout les outlets
    posés par Cosmos via `context["ti"].task.render_template`. En vrai `ti.task`
    est l'opérateur lui-même : on reproduit juste ça.
    """
    return {"params": params, "ti": SimpleNamespace(task=None)}


def run_pre_execute(params, **operator_kwargs):
    """Joue `pre_execute` sur un DbtBuild neuf et renvoie l'opérateur."""
    operator = DbtBuild(task_id="dbt_build_sous_test", select=["un_modele"], **operator_kwargs)
    context = make_context(params)
    context["ti"].task = operator
    operator.pre_execute(context=context)
    return operator


class TestSkipIfParam:
    def test_param_vrai_declenche_le_skip(self):
        with pytest.raises(AirflowSkipException, match="skip_dbt"):
            run_pre_execute({"skip_dbt": True}, skip_if_param="skip_dbt")

    def test_param_faux_laisse_passer(self):
        run_pre_execute({"skip_dbt": False}, skip_if_param="skip_dbt")

    def test_param_absent_laisse_passer(self):
        """Absent = non demandé : on exécute, plutôt que de sauter silencieusement."""
        run_pre_execute({}, skip_if_param="skip_dbt")


class TestRunIfParam:
    def test_param_faux_declenche_le_skip(self):
        with pytest.raises(AirflowSkipException, match="run_dbt_build"):
            run_pre_execute({"run_dbt_build": False}, run_if_param="run_dbt_build")

    def test_param_vrai_laisse_passer(self):
        run_pre_execute({"run_dbt_build": True}, run_if_param="run_dbt_build")

    def test_param_absent_declenche_le_skip(self):
        """Absent = non confirmé : on saute, plutôt que de lancer un build non voulu."""
        with pytest.raises(AirflowSkipException, match="run_dbt_build"):
            run_pre_execute({}, run_if_param="run_dbt_build")


class TestSansCondition:
    def test_aucun_param_configure_laisse_passer(self):
        run_pre_execute({"skip_dbt": True, "run_dbt_build": False})

    def test_contexte_sans_params_laisse_passer(self):
        operator = DbtBuild(task_id="dbt_build_sous_test", select=["un_modele"])
        context = {"ti": SimpleNamespace(task=operator)}
        operator.pre_execute(context=context)


class TestSelectCallable:
    def test_les_selecteurs_sont_calcules_a_l_execution(self):
        operator = run_pre_execute(
            {"dataset": "ocsge"},
            select_callable=lambda context: [f"{context['params']['dataset']}+"],
        )
        assert operator.select == ["ocsge+"]

    def test_le_skip_court_circuite_le_calcul(self):
        """Un build sauté ne doit pas évaluer le callable."""

        def callable_qui_explose(context):
            raise AssertionError("select_callable ne devrait pas être appelé sur un skip")

        with pytest.raises(AirflowSkipException):
            run_pre_execute(
                {"skip_dbt": True},
                skip_if_param="skip_dbt",
                select_callable=callable_qui_explose,
            )
