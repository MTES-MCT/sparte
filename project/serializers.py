from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers

from project.models import ReportDraft

from .models import Emprise


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
