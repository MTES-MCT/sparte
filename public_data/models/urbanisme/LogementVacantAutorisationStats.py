from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from public_data.models import LandModel
from public_data.models.urbanisme import AutorisationLogement, LogementVacant


class LogementVacantAutorisationStatsSerializer(serializers.Serializer):
    """Serializer for LogementVacant and AutorisationLogement combined stats."""

    year = serializers.IntegerField()
    autorisations = serializers.IntegerField()
    percent_autorisations_on_parc = serializers.FloatField()
    vacants_prive = serializers.IntegerField()
    percent_vacants_prive = serializers.FloatField()
    vacants_social = serializers.FloatField()
    percent_vacants_social = serializers.FloatField()
    ratio = serializers.FloatField()


class LogementVacantAutorisationStatsViewset(APIView):
    """
    API endpoint that returns combined stats for logement vacant and autorisation logement.

    Query params:
    - start_date: Start year
    - end_date: End year

    Returns the last year's data with all necessary statistics.
    """

    def get(self, request, land_type, land_id):
        try:
            land = LandModel.objects.get(land_type=land_type, land_id=land_id)
        except LandModel.DoesNotExist:
            return Response({"error": f"Land not found: {land_type}/{land_id}"}, status=status.HTTP_404_NOT_FOUND)

        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")

        if not start_date or not end_date:
            return Response(
                {"error": "Missing required parameters: start_date and end_date"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            start_date = int(start_date)
            end_date = int(end_date)
        except ValueError:
            return Response(
                {"error": "start_date and end_date must be integers"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get last year autorisation logement data
        last_year_autorisation = (
            AutorisationLogement.objects.filter(
                land_id=land.land_id,
                land_type=land.land_type,
                year=end_date,
            )
            .order_by("-year")
            .first()
        )

        # Get last year logement vacant data
        last_year_vacant = (
            LogementVacant.objects.filter(
                land_id=land.land_id,
                land_type=land.land_type,
                year=end_date,
            )
            .order_by("-year")
            .first()
        )

        if last_year_autorisation is None or last_year_vacant is None:
            return Response(
                {"error": "No data available for the specified period"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Build response
        data = {
            "year": end_date,
            "autorisations": last_year_autorisation.logements_autorises,
            "percent_autorisations_on_parc": round(last_year_autorisation.percent_autorises_on_parc_general, 2),
            "vacants_prive": last_year_vacant.logements_vacants_parc_prive,
            "percent_vacants_prive": round(last_year_vacant.logements_vacants_parc_prive_percent, 2),
            "vacants_social": last_year_vacant.logements_vacants_parc_social,
            "percent_vacants_social": round(last_year_vacant.logements_vacants_parc_social_percent, 2),
            "ratio": round(last_year_autorisation.percent_autorises_on_vacants_parc_general, 2),
        }

        serializer = LogementVacantAutorisationStatsSerializer(data)
        return Response(serializer.data)
