from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.request import Request as DRFRequest

from project.models import Project
from project.models.enums import ProjectChangeReason
from public_data.models import AdminRef, Land


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
        user=request.user if request.user and request.user.is_authenticated else None,
        analyse_start_date="2011",
        analyse_end_date="2023",
    )
    project._change_reason = ProjectChangeReason.CREATED_FROM_PUBLIC_KEY

    project.save()

    return JsonResponse({"id": project.pk}, status=201)
