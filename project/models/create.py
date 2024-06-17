from typing import List

import celery

from project import tasks
from project.models import Project
from project.models.enums import ProjectChangeReason
from public_data.models import AdminRef, Land
from users.models import User


@celery.shared_task
def map_tasks(project_id: str) -> List[celery.Task]:  # noqa: C901
    """Return a list of tasks to generate maps according to project state"""

    project = Project.objects.get(id=project_id)

    map_tasks = []

    not_a_commune = project.land_type != AdminRef.COMMUNE

    if not project.async_cover_image_done:
        map_tasks.append(tasks.generate_cover_image.si(project.id))

    if not_a_commune:
        if not project.async_generate_theme_map_conso_done:
            map_tasks.append(tasks.generate_theme_map_conso.si(project.id))

    if not_a_commune and project.has_complete_uniform_ocsge_coverage:
        if not project.async_generate_theme_map_artif_done:
            map_tasks.append(tasks.generate_theme_map_artif.si(project.id))

    if project.has_complete_uniform_ocsge_coverage:
        if not project.async_theme_map_understand_artif_done:
            map_tasks.append(tasks.generate_theme_map_understand_artif.si(project.id))

    if project.has_complete_uniform_ocsge_coverage and project.has_zonage_urbanisme:
        if not project.async_theme_map_gpu_done:
            map_tasks.append(tasks.generate_theme_map_gpu.si(project.id))
        if not project.async_theme_map_fill_gpu_done:
            map_tasks.append(tasks.generate_theme_map_fill_gpu.si(project.id))

    celery.group(*map_tasks, immutable=True).apply_async(queue="long")


def get_queue(project: Project) -> str:
    if project.land_type != AdminRef.COMMUNE:
        return "long"

    return "quick"


def trigger_async_tasks(project: Project, public_key: str | None = None) -> None:
    from brevo.tasks import send_diagnostic_to_brevo
    from metabase.tasks import async_create_stat_for_project
    from project import tasks as t

    tasks_list = []

    if not project.async_add_city_done:
        tasks_list.append(t.add_city.si(project.id, public_key))

    if not project.async_set_combined_emprise_done:
        tasks_list.append(t.set_combined_emprise.si(project.id))

    if not project.async_find_first_and_last_ocsge_done:
        tasks_list.append(t.find_first_and_last_ocsge.si(project.id))

    if not project.async_ocsge_coverage_status_done:
        tasks_list.append(t.calculate_project_ocsge_status.si(project.id))

    if not project.async_add_comparison_lands_done:
        tasks_list.append(t.add_comparison_lands.si(project.id))

    celery_kwargs = {}

    if project.land_type != AdminRef.COMMUNE:
        celery_kwargs["queue"] = "long"

    return celery.chain(
        *[
            *tasks_list,
            map_tasks.si(project.id),
            async_create_stat_for_project.si(project.id, do_location=True),
            send_diagnostic_to_brevo.si(project.id),
        ]
    ).apply_async(*celery_kwargs)


def create_from_public_key(
    public_key: str,
    start: str = "2011",
    end: str = "2022",
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
    project._change_reason = ProjectChangeReason.CREATED_FROM_PUBLIC_KEY
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

    project._change_reason = ProjectChangeReason.USER_UPDATED_PROJECT_FROM_PARAMS
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

    project._change_reason = ProjectChangeReason.NEW_OCSGE_HAS_BEEN_DELIVERED
    project.save()
