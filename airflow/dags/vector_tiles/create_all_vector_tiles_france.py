"""
DAG orchestrateur pour créer toutes les tuiles vectorielles et GeoJSON pour la France entière.

Ce DAG déclenche tous les autres DAGs de tuiles vectorielles pour tous les départements
et tous les millésimes disponibles.

Pour chaque département, il génère :
1. Tuiles PMTiles d'occupation du sol (millésimes 1 et 2)
2. Tuiles PMTiles de différence d'artificialisation
3. GeoJSON centroïdes de différence d'artificialisation
4. Tuiles PMTiles de différence d'imperméabilisation
5. GeoJSON centroïdes de différence d'imperméabilisation

En plus, il génère pour toute la France :
6. Tuiles PMTiles d'occupation du sol des friches (millésimes 1 et 2)
"""

import json

import pendulum

from airflow.decorators import dag
from airflow.operators.trigger_dagrun import TriggerDagRunOperator

with open("include/data/ocsge/sources.json", "r") as f:
    sources = json.load(f)

DEPARTEMENTS = list(sources.keys())
MILLESIMES = [1, 2]


@dag(
    start_date=pendulum.datetime(2024, 1, 1),
    schedule="@once",
    catchup=False,
    doc_md=__doc__,
    max_active_runs=1,
    default_args={"owner": "Alexis Athlani", "retries": 0},
    tags=["OCS GE", "Orchestration", "Vector Tiles"],
)
def create_all_vector_tiles_france():
    """
    DAG orchestrateur qui déclenche tous les DAGs de tuiles vectorielles
    pour tous les départements de France.
    """

    # 1. Occupation du sol par département et millésime
    occupation_du_sol_tasks = [
        TriggerDagRunOperator(
            task_id=f"trigger_occupation_du_sol_{millesime}_{dept}",
            trigger_dag_id="create_ocsge_vector_tiles",
            conf={
                "index": millesime,
                "departement": dept,
                "refresh_existing": False,
            },
            wait_for_completion=False,
            poke_interval=30,
        )
        for dept in DEPARTEMENTS
        for millesime in MILLESIMES
    ]

    # 2. Différence d'artificialisation (PMTiles) par département
    artif_diff_tasks = [
        TriggerDagRunOperator(
            task_id=f"trigger_artif_diff_{dept}",
            trigger_dag_id="create_ocsge_artif_diff_vector_tiles",
            conf={
                "departement": dept,
                "indexes": [1, 2],
                "refresh_existing": False,
            },
            wait_for_completion=False,
            poke_interval=30,
        )
        for dept in DEPARTEMENTS
    ]

    # 3. Différence d'artificialisation centroïdes (GeoJSON) par département
    artif_diff_centroid_tasks = [
        TriggerDagRunOperator(
            task_id=f"trigger_artif_diff_centroid_{dept}",
            trigger_dag_id="create_ocsge_artif_diff_centroid_vector_tiles",
            conf={
                "departement": dept,
                "indexes": [1, 2],
                "refresh_existing": False,
            },
            wait_for_completion=False,
            poke_interval=30,
        )
        for dept in DEPARTEMENTS
    ]

    # 4. Différence d'imperméabilisation (PMTiles) par département
    diff_tasks = [
        TriggerDagRunOperator(
            task_id=f"trigger_diff_{dept}",
            trigger_dag_id="create_ocsge_diff_vector_tiles",
            conf={
                "departement": dept,
                "indexes": [1, 2],
                "refresh_existing": False,
            },
            wait_for_completion=False,
            poke_interval=30,
        )
        for dept in DEPARTEMENTS
    ]

    # 5. Différence d'imperméabilisation centroïdes (GeoJSON) par département
    diff_centroid_tasks = [
        TriggerDagRunOperator(
            task_id=f"trigger_diff_centroid_{dept}",
            trigger_dag_id="create_ocsge_diff_centroid_vector_tiles",
            conf={
                "departement": dept,
                "indexes": [1, 2],
                "refresh_existing": False,
            },
            wait_for_completion=False,
            poke_interval=30,
        )
        for dept in DEPARTEMENTS
    ]

    # 6. Occupation du sol des friches (national) par millésime
    friche_tasks = [
        TriggerDagRunOperator(
            task_id=f"trigger_friche_{millesime}",
            trigger_dag_id="create_ocsge_friche_vector_tiles",
            conf={
                "year_index": millesime,
                "refresh_existing": False,
            },
            wait_for_completion=False,
            poke_interval=30,
        )
        for millesime in MILLESIMES
    ]

    # Toutes les tâches s'exécutent en parallèle
    # Pas de dépendances entre elles
    (
        occupation_du_sol_tasks
        + artif_diff_tasks
        + artif_diff_centroid_tasks
        + diff_tasks
        + diff_centroid_tasks
        + friche_tasks
    )


create_all_vector_tiles_france()
