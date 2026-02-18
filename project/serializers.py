from rest_framework import serializers
from rest_framework.serializers import SerializerMethodField
from rest_framework_gis import serializers as gis_serializers

from project.models import Project, ReportDraft, Request, RequestedDocumentChoices

from .models import Emprise


class ProjectDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "land_id",
            "land_type",
        ]


class ProjectDownloadLinkSerializer(serializers.ModelSerializer):
    rapport_local_url = SerializerMethodField()
    rapport_complet_url = SerializerMethodField()

    def _is_report_outdated(self, request_obj, project):
        if not request_obj or not request_obj.sent_file:
            return True

        return project.updated_date > request_obj.created_date

    def get_rapport_local_url(self, obj):
        project: Project = obj
        requests = Request.objects.filter(
            project=project,
            requested_document=RequestedDocumentChoices.RAPPORT_LOCAL,
        ).order_by("-created_date")

        if requests.exists():
            latest_request = requests.first()
            if not self._is_report_outdated(latest_request, project):
                return latest_request.sent_file.url if latest_request.sent_file else None

        return None

    def get_rapport_complet_url(self, obj):
        project: Project = obj
        requests = Request.objects.filter(
            project=project,
            requested_document=RequestedDocumentChoices.RAPPORT_COMPLET,
        ).order_by("-created_date")

        if requests.exists():
            latest_request = requests.first()
            if not self._is_report_outdated(latest_request, project):
                return latest_request.sent_file.url if latest_request.sent_file else None

        return None

    class Meta:
        model = Project
        fields = [
            "id",
            "rapport_local_url",
            "rapport_complet_url",
        ]


class EmpriseSerializer(gis_serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "project",
        )
        geo_field = "mpoly"
        model = Emprise


class ReportDraftSerializer(serializers.ModelSerializer):
    report_type_display = serializers.CharField(source="get_report_type_display", read_only=True)

    class Meta:
        model = ReportDraft
        fields = [
            "id",
            "report_type",
            "report_type_display",
            "name",
            "content",
            "land_type",
            "land_id",
            "comparison_lands",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "report_type_display"]


class ReportDraftListSerializer(serializers.ModelSerializer):
    report_type_display = serializers.CharField(source="get_report_type_display", read_only=True)

    class Meta:
        model = ReportDraft
        fields = [
            "id",
            "report_type",
            "report_type_display",
            "name",
            "created_at",
            "updated_at",
        ]
