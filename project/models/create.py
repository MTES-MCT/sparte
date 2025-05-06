from typing import List

import celery
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.request import Request as DRFRequest

from project import tasks
from project.models import Project
from project.models.enums import ProjectChangeReason
from project.models.request import Request, RequestedDocumentChoices
from public_data.infra.planning_competency.PlanningCompetencyServiceSudocuh import (
    PlanningCompetencyServiceSudocuh,
)
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

    celery.group(*map_tasks, immutable=True).apply_async(queue="long")


def trigger_async_tasks(project: Project, public_key: str | None = None) -> None:
    from brevo.tasks import send_diagnostic_to_brevo
    from metabase.tasks import async_create_stat_for_project
    from project import tasks as t

    tasks_list = []

    if not project.async_set_combined_emprise_done:
        tasks_list.append(t.set_combined_emprise.si(project.id))

    if not project.async_add_comparison_lands_done:
        tasks_list.append(t.add_comparison_lands.si(project.id))

    celery.chain(
        *[
            map_tasks.si(project.id),
            async_create_stat_for_project.si(project.id, do_location=True),
            send_diagnostic_to_brevo.si(project.id),
        ]
    ).apply_async()

    return celery.chain(*tasks_list).run()


@celery.shared_task
def create_request_rnu_package_one_off(project_id: int) -> None:
    project = Project.objects.get(pk=project_id)
    user: User = project.user
    request = Request.objects.create(
        project=project,
        first_name=user.first_name,
        last_name=user.last_name,
        function=user.function,
        organism=user.organism,
        email=user.email,
        user=user,
        requested_document=RequestedDocumentChoices.RAPPORT_LOCAL,
        du_en_cours=PlanningCompetencyServiceSudocuh.planning_document_in_revision(project.land),
        competence_urba=False,
    )
    return request.id


@api_view(http_method_names=["POST"])
def create_project_api_view(request: DRFRequest) -> JsonResponse:
    land_id = request.data.get("land_id")
    land_type = request.data.get("land_type")
    public_key = f"{land_type}_{land_id}"
    land = Land(public_key)
    level = AdminRef.get_analysis_default_level(public_key.split("_")[0])
    project = Project(
        name=f"Diagnostic de {land.name}",
        is_public=True,
        level=level,
        land_id=str(land.official_id),
        land_type=land.land_type,
        territory_name=land.name,
        user=request.user or None,
    )
    project._change_reason = ProjectChangeReason.CREATED_FROM_PUBLIC_KEY

    project.save()

    trigger_async_tasks(project, public_key)

    return JsonResponse({"id": project.pk}, status=201)
