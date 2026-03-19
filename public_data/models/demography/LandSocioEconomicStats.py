from rest_framework import generics, serializers
from rest_framework.response import Response

from public_data.models.demography.LandPop import LandPop
from public_data.models.dossier_complet.LandDcEmploisLieuTravail import (
    LandDcEmploisLieuTravail,
)
from public_data.models.dossier_complet.LandDcMenages import LandDcMenages


def _weighted_annual_evolution(v_11, v_16, v_22, from_year, to_year):
    """Compute weighted annual evolution from 3 census values (2011, 2016, 2022).

    The annual rate for each sub-period is:
      - 2011-2016: (v_16 - v_11) / 5
      - 2016-2022: (v_22 - v_16) / 6

    The diagnostic period [from_year, to_year] is intersected with each
    sub-period and the rates are weighted by overlap length.
    """
    if v_11 is None or v_16 is None or v_22 is None:
        return None, None

    start = max(from_year, 2011)
    end = min(to_year, 2022)
    if start >= end:
        return None, None

    rate_1 = (v_16 - v_11) / 5
    rate_2 = (v_22 - v_16) / 6

    overlap_1 = max(0, min(2016, end) - max(2011, start))
    overlap_2 = max(0, min(2022, end) - max(2016, start))
    total_years = overlap_1 + overlap_2

    if total_years == 0:
        return None, None

    annual_evolution = (overlap_1 * rate_1 + overlap_2 * rate_2) / total_years

    # Percent: annualized rate for each sub-period
    pct_1 = ((v_16 - v_11) / v_11 * 100 / 5) if v_11 else 0
    pct_2 = ((v_22 - v_16) / v_16 * 100 / 6) if v_16 else 0
    annual_pct = (overlap_1 * pct_1 + overlap_2 * pct_2) / total_years

    return round(annual_evolution, 1), round(annual_pct, 2)


class LandSocioEconomicStatsSerializer(serializers.Serializer):
    population_annual_evolution = serializers.FloatField(allow_null=True)
    population_annual_evolution_percent = serializers.FloatField(allow_null=True)
    menages_annual_evolution = serializers.FloatField(allow_null=True)
    menages_annual_evolution_percent = serializers.FloatField(allow_null=True)
    emplois_annual_evolution = serializers.FloatField(allow_null=True)
    emplois_annual_evolution_percent = serializers.FloatField(allow_null=True)


class LandSocioEconomicStatsViewset(generics.GenericAPIView):
    serializer_class = LandSocioEconomicStatsSerializer

    def get(self, request):
        land_id = request.query_params.get("land_id")
        land_type = request.query_params.get("land_type")
        from_year = int(request.query_params.get("from_year", 2011))
        to_year = int(request.query_params.get("to_year", 2022))

        # Cap to_year at 2022 to exclude projected population
        pop_to_year = min(to_year, 2022)

        # --- Population ---
        pop_qs = LandPop.objects.filter(
            land_id=land_id,
            land_type=land_type,
            source=LandPop.Source.INSEE,
            year__gte=from_year,
            year__lte=pop_to_year,
        )

        pop_first = pop_qs.order_by("year").first()
        pop_last = pop_qs.order_by("-year").first()
        nb_years = pop_to_year - from_year

        if pop_first and pop_last and nb_years > 0:
            total_evolution = pop_last.population - pop_first.population
            pop_annual = round(total_evolution / nb_years, 1)
            pop_annual_pct = (
                round(total_evolution / pop_first.population * 100 / nb_years, 2) if pop_first.population else None
            )
        else:
            pop_annual = None
            pop_annual_pct = None

        # --- Ménages ---
        menages_obj = LandDcMenages.objects.filter(land_id=land_id, land_type=land_type).first()
        if menages_obj:
            menages_annual, menages_annual_pct = _weighted_annual_evolution(
                menages_obj.menages_11,
                menages_obj.menages_16,
                menages_obj.menages_22,
                from_year,
                to_year,
            )
        else:
            menages_annual, menages_annual_pct = None, None

        # --- Emplois ---
        emplois_obj = LandDcEmploisLieuTravail.objects.filter(land_id=land_id, land_type=land_type).first()
        if emplois_obj:
            emplois_annual, emplois_annual_pct = _weighted_annual_evolution(
                emplois_obj.emplois_11,
                emplois_obj.emplois_16,
                emplois_obj.emplois_22,
                from_year,
                to_year,
            )
        else:
            emplois_annual, emplois_annual_pct = None, None

        data = {
            "population_annual_evolution": pop_annual,
            "population_annual_evolution_percent": pop_annual_pct,
            "menages_annual_evolution": menages_annual,
            "menages_annual_evolution_percent": menages_annual_pct,
            "emplois_annual_evolution": emplois_annual,
            "emplois_annual_evolution_percent": emplois_annual_pct,
        }

        serializer = self.get_serializer(data)
        return Response(serializer.data)
