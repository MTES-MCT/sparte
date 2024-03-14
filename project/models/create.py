""" Contains all logic to create a project

REFACTORING : this module should be expanded to contain all business logics. It should include how to create a project,
but also all function to handle project life such as change of period asked from a user, new OCS GE's delivery and so
on. At last, it should be moved in domains/ folder.
"""
from types import ModuleType
from typing import List

import celery

from project.models import Project
from public_data.models import AdminRef, Land
from users.models import User


def get_map_generation_tasks(project: Project, t: ModuleType) -> List[celery.Task]:
    """Return a list of tasks to generate maps according to project state"""
    return [
        getattr(t, task_name).si(project.id)
        for task_name, bool_field_name in [
            ("generate_cover_image", "async_cover_image_done"),
            ("generate_theme_map_conso", "async_generate_theme_map_conso_done"),
            ("generate_theme_map_artif", "async_generate_theme_map_artif_done"),
            ("generate_theme_map_understand_artif", "async_theme_map_understand_artif_done"),
            ("generate_theme_map_gpu", "async_theme_map_gpu_done"),
            ("generate_theme_map_fill_gpu", "async_theme_map_fill_gpu_done"),
        ]
        if getattr(project, bool_field_name) is False
    ]


def trigger_async_tasks(project: Project, public_key: str | None = None) -> None:
    from brevo.tasks import send_diagnostic_to_brevo
    from metabase.tasks import async_create_stat_for_project
    from project import tasks as t

    tasks_chain = []
    if not project.async_add_city_done:
        if public_key is None:
            raise ValueError("Cannot add_cities to project without public_key.")
        tasks_chain.append(t.add_city.si(project.id, public_key))
    if not project.async_set_combined_emprise_done:
        tasks_chain.append(t.set_combined_emprise.si(project.id))

    group_1 = []
    if not project.async_find_first_and_last_ocsge_done:
        group_1.append(t.find_first_and_last_ocsge.si(project.id))
    if not project.async_ocsge_coverage_status_done:
        group_1.append(t.calculate_project_ocsge_status.si(project.id))
    if not project.async_add_comparison_lands_done:
        group_1.append(t.add_comparison_lands.si(project.id))
    if group_1:
        tasks_chain.append(celery.group(*group_1))

    map_group = get_map_generation_tasks(project, t)
    if map_group:
        tasks_chain.append(celery.group(*map_group))

    # Exécution de la chaîne
    if tasks_chain:
        celery.chain(
            *tasks_chain,
            celery.group(
                async_create_stat_for_project.si(project.id, do_location=True),
                send_diagnostic_to_brevo.si(project.id),
            ),
        ).apply_async()


def create_from_public_key(
    public_key: str,
    start: str = "2009",
    end: str = "2021",
    user: User | None = None,
) -> Project:
    """Create a project from one only public_key"""

    land = Land(public_key)
    level = AdminRef.get_analysis_default_level(public_key.split("_")[0])
    project = Project(
        name=f"Diagnostic de {land.name}",
        is_public=True,
        analyse_start_date=start,
        analyse_end_date=end,
        level=level,
        land_id=str(land.id),
        land_type=land.land_type,
        territory_name=land.name,
        user=user if user and user.is_authenticated else None,
    )
    project._change_reason = "create_from_public_key"
    project.set_success(save=True)

    trigger_async_tasks(project, public_key)

    return project


def update_period(project: Project, start: str, end: str) -> None:
    """Update the period of the project"""

    project.analyse_start_date = start
    project.analyse_end_date = end

    # list redo work
    project.async_find_first_and_last_ocsge_done = False
    project.async_ocsge_coverage_status_done = False
    project.async_generate_theme_map_conso_done = False
    project.async_generate_theme_map_artif_done = False
    project.async_theme_map_understand_artif_done = False
    project.async_theme_map_fill_gpu_done = False

    project._change_reason = "update_project_period"
    project.save()

    trigger_async_tasks(project)


def update_ocsge(project: Project):
    """Update cached data if new OCSGE has been delivered.
    This function is mainly called after data migration when new a departement is added (or new millesime)
    What it does:
    * search if start and end period of OCS GE analysis has been changed
    * update ocs ge status (available, partial, unavailable...)
    * build images maps :
      * thematic map on city artificialisation
      * understand artificialisation map
      * GPU filled up with artificial items
    """

    # list redo work
    project.async_find_first_and_last_ocsge_done = False
    project.async_ocsge_coverage_status_done = False
    project.async_generate_theme_map_artif_done = False
    project.async_theme_map_understand_artif_done = False
    project.async_theme_map_fill_gpu_done = False

    project._change_reason = "new_ocsge_has_been_delivered"
    project.save()

    trigger_async_tasks(project)
