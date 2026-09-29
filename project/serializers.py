from rest_framework import serializers

from project.models import ReportDraft
from project.models.user_land_preference import UserLandPreference


class ReportDraftSerializer(serializers.ModelSerializer):
    report_type_display = serializers.CharField(source="get_report_type_display", read_only=True)
    owner_preference = serializers.SerializerMethodField()

    def get_owner_preference(self, obj):
        """
        Préférences du propriétaire du brouillon pour son territoire.
        Utilisées par le rendu PDF : Puppeteer n'a pas de session, et l'API des
        préférences renvoie celles de l'utilisateur courant (vides en anonyme).
        """
        pref = UserLandPreference.objects.filter(
            user_id=obj.user_id,
            land_type=obj.land_type,
            land_id=obj.land_id,
        ).first()
        if pref is None:
            return {"target_2031": None, "comparison_lands": []}
        return {
            "target_2031": float(pref.target_2031) if pref.target_2031 is not None else None,
            "comparison_lands": pref.comparison_lands,
        }

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
            "owner_preference",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "report_type_display", "owner_preference"]


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
