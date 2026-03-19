import hashlib
import json

from django.core.cache import cache
from django.http import FileResponse, Http404, JsonResponse
from django.urls import include, path
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter

from home.api import PageFeedbackViewSet
from project.api_views import (
    ReportDraftViewSet,
    ToggleFavoriteAPIView,
    UpdatePreferenceComparisonLandsAPIView,
    UpdatePreferenceTarget2031APIView,
    UserLandPreferenceAPIView,
)
from project.charts import (
    AnnualConsoByDeterminantChart,
    AnnualConsoByDeterminantChartExport,
    AnnualTotalConsoChart,
    AnnualTotalConsoChartExport,
    ConsoByDeterminantPieChart,
    ConsoByDeterminantPieChartExport,
    ObjectiveChart,
    ObjectiveChartExport,
    TerritorialisationAnneesRestantesMap,
    TerritorialisationConsoMap,
    TerritorialisationDepassement2031Map,
    TerritorialisationEffortMap,
    TerritorialisationMap,
    TerritorialisationObjectifMap,
    TerritorialisationProgressMap,
    TerritorialisationProjection2031Map,
    TerritorialisationRestanteMap,
    TerritorialisationRythmeMap,
    TerritorialisationTauxAtteinte2031Map,
)
from project.charts.artificialisation import (
    ArtifByCouverturePieChart,
    ArtifByCouverturePieChartExport,
    ArtifByUsagePieChart,
    ArtifFluxByCouverture,
    ArtifFluxByCouvertureExport,
    ArtifFluxByUsage,
    ArtifFluxByUsageExport,
    ArtifMap,
    ArtifMapExport,
    ArtifNetFluxChart,
    ArtifNetFluxChartExport,
    ArtifSyntheseChart,
    ArtifSyntheseChartExport,
    ArtifUsagePieChartExport,
)
from project.charts.consommation import (
    ComparisonMap,
    ComparisonMapExport,
    ConsoAnnualChart,
    ConsoMap,
    ConsoMapBubble,
    ConsoMapBubbleExport,
    ConsoMapExport,
    ConsoMapRelative,
    ConsoMapRelativeExport,
)
from project.charts.consommation.AnnualConsoComparisonChart import (
    AnnualConsoComparisonChart,
    AnnualConsoComparisonChartExport,
)
from project.charts.consommation.AnnualConsoProportionalComparisonChart import (
    AnnualConsoProportionalComparisonChart,
    AnnualConsoProportionalComparisonChartExport,
)
from project.charts.demography.PopulationConsoComparisonChart import (
    PopulationConsoComparisonChart,
    PopulationConsoComparisonChartExport,
)
from project.charts.demography.PopulationConsoProgressionChart import (
    PopulationConsoProgressionChart,
)
from project.charts.dossier_complet import (
    DcCreationsEntreprisesChart,
    DcCspRepartitionChart,
    DcEmploiChomageChart,
    DcEmploiConsoComparisonChart,
    DcEmploiConsoMap,
    DcEmploiMap,
    DcEmploiVsConsoChart,
    DcEquipementsBpeChart,
    DcLogementConsoComparisonChart,
    DcLogementConsoMap,
    DcLogementConstructionChart,
    DcLogementMap,
    DcLogementParcChart,
    DcLogementVacantMap,
    DcLogementVsConsoChart,
    DcMenagesConsoComparisonChart,
    DcMenagesConsoComparisonChartExport,
    DcMenagesConsoMap,
    DcMenagesEvolutionChart,
    DcPauvreteMap,
    DcPopulationConsoMap,
    DcPopulationEvolutionChart,
    DcPopulationMap,
    DcPopulationPyramidChart,
    DcPopulationVsConsoChart,
    DcResidencesSecondairesChart,
    DcResidencesSecondairesConsoMap,
    DcResidencesSecondairesMap,
    DcRevenusMap,
    DcRevenusPauvreteChart,
    DcTourismeChart,
)
from project.charts.impermeabilisation import (
    ImperByCouverturePieChart,
    ImperByCouverturePieChartExport,
    ImperByUsagePieChart,
    ImperFluxByCouverture,
    ImperFluxByCouvertureExport,
    ImperFluxByUsage,
    ImperFluxByUsageExport,
    ImperMap,
    ImperNetFluxChart,
    ImperSyntheseChart,
    ImperUsagePieChartExport,
)
from project.charts.urbanisme import (
    FricheArtifCompositionChart,
    FricheArtifCompositionChartExport,
    FricheImperCompositionChart,
    FricheImperCompositionChartExport,
    FrichePollutionChart,
    FricheSurfaceChart,
    FricheTypeChart,
    FricheZonageEnvironnementalChart,
    FricheZonageTypeChart,
    FricheZoneActiviteChart,
    LogementVacantAutorisationLogementRatioProgressionChart,
    LogementVacantConsoProgressionChart,
    LogementVacantMapAbsolute,
    LogementVacantMapPercent,
    LogementVacantTauxProgressionChart,
)
from public_data.models import (
    ArtifZonageIndexViewset,
    ArtifZonageViewset,
    ImperZonageIndexViewset,
    ImperZonageViewset,
    LandArtifFluxCouvertureCompositionIndexViewset,
    LandArtifFluxCouvertureCompositionViewset,
    LandArtifFluxIndexViewset,
    LandArtifFluxUsageCompositionIndexViewset,
    LandArtifFluxUsageCompositionViewset,
    LandArtifFluxViewset,
    LandArtifStockCouvertureCompositionViewset,
    LandArtifStockIndexViewset,
    LandArtifStockUsageCompositionViewset,
    LandArtifStockViewset,
    LandCarroyageBoundsViewset,
    LandChildrenGeomViewset,
    LandConsoStatsViewset,
    LandFricheCentroidViewset,
    LandFricheGeojsonViewset,
    LandFrichePollutionViewset,
    LandFricheStatutViewset,
    LandFricheSurfaceRankViewset,
    LandFricheTypeViewset,
    LandFricheViewset,
    LandFricheZonageEnvironnementaleViewset,
    LandFricheZonageTypeViewset,
    LandFricheZoneActiviteViewset,
    LandImperFluxIndexViewset,
    LandImperFluxViewset,
    LandImperStockCouvertureCompositionViewset,
    LandImperStockIndexViewset,
    LandImperStockUsageCompositionViewset,
    LandImperStockViewset,
    LandModel,
    LandModelFullGeomViewset,
    LandModelGeomViewset,
    LandModelViewset,
    LandPopStatsViewset,
    LandPopulationDensityViewset,
    LandSocioEconomicStatsViewset,
    NearestTerritoriesViewset,
)
from public_data.models.urbanisme import LogementVacantAutorisationStatsViewset
from utils.antispam import generate_token

app_name = "api"

router = DefaultRouter()
router.register(r"report-drafts", ReportDraftViewSet, basename="report-draft")
router.register(r"feedback", PageFeedbackViewSet, basename="feedback")


@api_view(["GET"])
def antispam_token_view(request):
    return Response({"token": generate_token()})


@api_view(["GET"])
def me_view(request):
    """Retourne les informations de l'utilisateur connecté."""
    user = request.user
    if user.is_authenticated:
        return Response(
            {
                "is_authenticated": True,
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "organism": getattr(user, "organism", None),
                "function": getattr(user, "function", None),
                "groups": list(user.groups.values_list("name", flat=True)),
            }
        )
    return Response(
        {
            "is_authenticated": False,
            "groups": [],
        }
    )


def get_chart_klass_or_404(chart_id):
    charts = {
        "pie_artif_by_couverture": ArtifByCouverturePieChart,
        "pie_artif_by_couverture_export": ArtifByCouverturePieChartExport,
        "pie_imper_by_couverture": ImperByCouverturePieChart,
        "pie_imper_by_couverture_export": ImperByCouverturePieChartExport,
        "pie_artif_by_usage": ArtifByUsagePieChart,
        "pie_artif_by_usage_export": ArtifUsagePieChartExport,
        "pie_imper_by_usage": ImperByUsagePieChart,
        "pie_imper_by_usage_export": ImperUsagePieChartExport,
        "artif_map": ArtifMap,
        "artif_map_export": ArtifMapExport,
        "imper_map": ImperMap,
        "conso_map": ConsoMap,
        "conso_map_export": ConsoMapExport,
        "conso_map_relative": ConsoMapRelative,
        "conso_map_relative_export": ConsoMapRelativeExport,
        "conso_map_bubble": ConsoMapBubble,
        "conso_map_bubble_export": ConsoMapBubbleExport,
        "comparison_map": ComparisonMap,
        "comparison_map_export": ComparisonMapExport,
        "friche_artif_composition": FricheArtifCompositionChart,
        "friche_artif_composition_export": FricheArtifCompositionChartExport,
        "friche_imper_composition": FricheImperCompositionChart,
        "friche_imper_composition_export": FricheImperCompositionChartExport,
        "friche_pollution": FrichePollutionChart,
        "friche_surface": FricheSurfaceChart,
        "friche_type": FricheTypeChart,
        "friche_zonage_environnemental": FricheZonageEnvironnementalChart,
        "friche_zonage_type": FricheZonageTypeChart,
        "friche_zone_activite": FricheZoneActiviteChart,
        "conso_annual": ConsoAnnualChart,
        "artif_synthese": ArtifSyntheseChart,
        "artif_synthese_export": ArtifSyntheseChartExport,
        "imper_synthese": ImperSyntheseChart,
        "artif_net_flux": ArtifNetFluxChart,
        "artif_net_flux_export": ArtifNetFluxChartExport,
        "artif_flux_by_couverture": ArtifFluxByCouverture,
        "artif_flux_by_couverture_export": ArtifFluxByCouvertureExport,
        "artif_flux_by_usage": ArtifFluxByUsage,
        "artif_flux_by_usage_export": ArtifFluxByUsageExport,
        "imper_net_flux": ImperNetFluxChart,
        "imper_flux_by_couverture": ImperFluxByCouverture,
        "imper_flux_by_couverture_export": ImperFluxByCouvertureExport,
        "imper_flux_by_usage": ImperFluxByUsage,
        "imper_flux_by_usage_export": ImperFluxByUsageExport,
        # Consommation charts
        "annual_total_conso_chart": AnnualTotalConsoChart,
        "annual_total_conso_chart_export": AnnualTotalConsoChartExport,
        "chart_determinant": AnnualConsoByDeterminantChart,
        "chart_determinant_export": AnnualConsoByDeterminantChartExport,
        "pie_determinant": ConsoByDeterminantPieChart,
        "pie_determinant_export": ConsoByDeterminantPieChartExport,
        "comparison_chart": AnnualConsoComparisonChart,
        "comparison_chart_export": AnnualConsoComparisonChartExport,
        "surface_proportional_chart": AnnualConsoProportionalComparisonChart,
        "surface_proportional_chart_export": AnnualConsoProportionalComparisonChartExport,
        "population_conso_progression_chart": PopulationConsoProgressionChart,
        "population_conso_comparison_chart": PopulationConsoComparisonChart,
        "population_conso_comparison_chart_export": PopulationConsoComparisonChartExport,
        # Objective chart
        "objective_chart": ObjectiveChart,
        "objective_chart_export": ObjectiveChartExport,
        # Territorialisation
        "territorialisation_map": TerritorialisationMap,
        "territorialisation_progress_map": TerritorialisationProgressMap,
        "territorialisation_conso_map": TerritorialisationConsoMap,
        "territorialisation_objectif_map": TerritorialisationObjectifMap,
        "territorialisation_restante_map": TerritorialisationRestanteMap,
        "territorialisation_annees_restantes_map": TerritorialisationAnneesRestantesMap,
        "territorialisation_effort_map": TerritorialisationEffortMap,
        "territorialisation_rythme_map": TerritorialisationRythmeMap,
        "territorialisation_projection_2031_map": TerritorialisationProjection2031Map,
        "territorialisation_depassement_2031_map": TerritorialisationDepassement2031Map,
        "territorialisation_taux_atteinte_2031_map": TerritorialisationTauxAtteinte2031Map,
        # Logement vacant charts
        "logement_vacant_conso_progression_chart": LogementVacantConsoProgressionChart,
        "logement_vacant_autorisation_ratio_progression_chart": LogementVacantAutorisationLogementRatioProgressionChart,  # noqa E501
        "logement_vacant_taux_progression_chart": LogementVacantTauxProgressionChart,
        "logement_vacant_map_percent": LogementVacantMapPercent,
        "logement_vacant_map_absolute": LogementVacantMapAbsolute,
        # Dossier complet INSEE charts
        "dc_population_evolution": DcPopulationEvolutionChart,
        "dc_population_pyramid": DcPopulationPyramidChart,
        "dc_logement_parc": DcLogementParcChart,
        "dc_logement_construction": DcLogementConstructionChart,
        "dc_menages_evolution": DcMenagesEvolutionChart,
        "dc_emploi_chomage": DcEmploiChomageChart,
        "dc_csp_repartition": DcCspRepartitionChart,
        "dc_revenus_pauvrete": DcRevenusPauvreteChart,
        "dc_creations_entreprises": DcCreationsEntreprisesChart,
        "dc_equipements_bpe": DcEquipementsBpeChart,
        "dc_tourisme": DcTourismeChart,
        "dc_population_vs_conso": DcPopulationVsConsoChart,
        "dc_logement_vs_conso": DcLogementVsConsoChart,
        "dc_emploi_vs_conso": DcEmploiVsConsoChart,
        # Dossier complet INSEE maps
        "dc_population_map": DcPopulationMap,
        "dc_logement_map": DcLogementMap,
        "dc_logement_vacant_map": DcLogementVacantMap,
        "dc_emploi_map": DcEmploiMap,
        "dc_revenus_map": DcRevenusMap,
        "dc_pauvrete_map": DcPauvreteMap,
        "dc_population_conso_map": DcPopulationConsoMap,
        "dc_logement_conso_map": DcLogementConsoMap,
        "dc_emploi_conso_map": DcEmploiConsoMap,
        "dc_menages_conso_map": DcMenagesConsoMap,
        "dc_logement_conso_comparison_chart": DcLogementConsoComparisonChart,
        "dc_menages_conso_comparison_chart": DcMenagesConsoComparisonChart,
        "dc_menages_conso_comparison_chart_export": DcMenagesConsoComparisonChartExport,
        "dc_emploi_conso_comparison_chart": DcEmploiConsoComparisonChart,
        "dc_residences_secondaires": DcResidencesSecondairesChart,
        "dc_residences_secondaires_conso_map": DcResidencesSecondairesConsoMap,
        "dc_residences_secondaires_map": DcResidencesSecondairesMap,
    }

    if chart_id not in charts:
        raise Http404(f"Chart {chart_id} not found, possible values are {list(charts.keys())}")

    return charts[chart_id]


def chart_view_json_response(chart):
    return JsonResponse(
        data={
            "highcharts_options": chart.chart,
            "data_table": getattr(chart, "data_table", None),
        }
    )


def chart_view_file_response(chart, id, land_type, land_id):
    return FileResponse(
        open(chart.get_temp_image(width=chart.print_width), "rb"),
        filename=f"{id}_{land_type}_{land_id}.png",
        as_attachment=False,
    )


def _chart_cache_key(id, land_type, land_id, params):
    params_str = json.dumps(params, sort_keys=True)
    h = hashlib.md5(params_str.encode()).hexdigest()
    return f"chart:{id}:{land_type}:{land_id}:{h}"


def chart_view(request, id, land_type, land_id):
    chart_params = request.GET.dict()

    # PNG responses are not cached
    if chart_params.get("format") == "png":
        land = LandModel.objects.get(land_type=land_type, land_id=land_id)
        chart_klass = get_chart_klass_or_404(id)
        user = request.user if request.user.is_authenticated else None
        chart = chart_klass(land=land, params=chart_params, user=user)
        return chart_view_file_response(chart=chart, id=id, land_type=land_type, land_id=land_id)

    cache_key = _chart_cache_key(id, land_type, land_id, chart_params)
    cached = cache.get(cache_key)
    if cached is not None:
        return JsonResponse(data=cached)

    land = LandModel.objects.get(land_type=land_type, land_id=land_id)
    chart_klass = get_chart_klass_or_404(id)
    user = request.user if request.user.is_authenticated else None
    chart = chart_klass(land=land, params=chart_params, user=user)

    data = {
        "highcharts_options": chart.chart,
        "data_table": getattr(chart, "data_table", None),
    }
    cache.set(cache_key, data, timeout=60 * 60 * 24)  # 24 hours
    return JsonResponse(data=data)


urlpatterns = [
    path("", include(router.urls)),
    path("me/", me_view, name="me"),
    path("token/", antispam_token_view, name="antispam-token"),
    path(
        "preference/<str:land_type>/<str:land_id>/",
        UserLandPreferenceAPIView.as_view(),
        name="user-land-preference",
    ),
    path(
        "preference/<str:land_type>/<str:land_id>/target-2031/",
        UpdatePreferenceTarget2031APIView.as_view(),
        name="update-preference-target-2031",
    ),
    path(
        "preference/<str:land_type>/<str:land_id>/comparison-lands/",
        UpdatePreferenceComparisonLandsAPIView.as_view(),
        name="update-preference-comparison-lands",
    ),
    path(
        "preference/<str:land_type>/<str:land_id>/toggle-favorite/",
        ToggleFavoriteAPIView.as_view(),
        name="toggle-favorite",
    ),
    path("chart/<str:id>/<str:land_type>/<str:land_id>", chart_view, name="chart"),
    path(
        "logementvacantautorisationstats/<str:land_type>/<str:land_id>",
        LogementVacantAutorisationStatsViewset.as_view(),
        name="logementvacantautorisationstats",
    ),
    path("landartifstock/", LandArtifStockViewset.as_view(), name="artifstock"),
    path("landimperstock/", LandImperStockViewset.as_view(), name="imperstock"),
    path("landartifstockindex/", LandArtifStockIndexViewset.as_view(), name="artifstockindex"),
    path("landimperstockindex/", LandImperStockIndexViewset.as_view(), name="imperstockindex"),
    path("landcarroyagebounds/", LandCarroyageBoundsViewset.as_view(), name="landcarroyagebounds"),
    path("landconsostats/", LandConsoStatsViewset.as_view(), name="consostats"),
    path("landpopstats/", LandPopStatsViewset.as_view(), name="popstats"),
    path("landpopulationdensity/", LandPopulationDensityViewset.as_view(), name="populationdensity"),
    path("landsocioeconomicstats/", LandSocioEconomicStatsViewset.as_view(), name="socioeconomicstats"),
    path("nearestterritories/", NearestTerritoriesViewset.as_view(), name="nearestterritories"),
    path("artifzonageindex/", ArtifZonageIndexViewset.as_view(), name="artifzonageindex"),
    path("imperzonageindex/", ImperZonageIndexViewset.as_view(), name="imperzonageindex"),
    path("artifzonage/", ArtifZonageViewset.as_view(), name="artifzonageindex"),
    path("imperzonage/", ImperZonageViewset.as_view(), name="imperzonageindex"),
    path("landimperflux/", LandImperFluxViewset.as_view(), name="imperflux"),
    path("landimperfluxindex/", LandImperFluxIndexViewset.as_view(), name="imperfluxindex"),
    path("landartifflux/", LandArtifFluxViewset.as_view(), name="artifflux"),
    path("landartiffluxindex/", LandArtifFluxIndexViewset.as_view(), name="artiffluxindex"),
    path(
        "landartiffluxcouverturecomposition/",
        LandArtifFluxCouvertureCompositionViewset.as_view(),
        name="artiffluxcouverturecomposition",
    ),
    path(
        "landartiffluxcouverturecompositionindex/",
        LandArtifFluxCouvertureCompositionIndexViewset.as_view(),
        name="artiffluxcouverturecompositionindex",
    ),
    path(
        "landartiffluxusagecomposition/",
        LandArtifFluxUsageCompositionViewset.as_view(),
        name="artiffluxusagecomposition",
    ),
    path(
        "landartiffluxusagecompositionindex/",
        LandArtifFluxUsageCompositionIndexViewset.as_view(),
        name="artiffluxusagecompositionindex",
    ),
    path(
        "landartifstockcouverturecomposition/",
        LandArtifStockCouvertureCompositionViewset.as_view(),
        name="artifstockcouverturecomposition",
    ),
    path(
        "landimperstockcouverturecomposition/",
        LandImperStockCouvertureCompositionViewset.as_view(),
        name="imperstockcouverturecomposition",
    ),
    path(
        "landartifstockusagecomposition/",
        LandArtifStockUsageCompositionViewset.as_view(),
        name="artifstockusagecomposition",
    ),
    path(
        "landimperstockusagecomposition/",
        LandImperStockUsageCompositionViewset.as_view(),
        name="imperstockusagecomposition",
    ),
    path(
        "landfrichepollution/",
        LandFrichePollutionViewset.as_view(),
        name="landfrichepollution",
    ),
    path(
        "landfrichezoneactivite/",
        LandFricheZoneActiviteViewset.as_view(),
        name="landfrichezoneactivite",
    ),
    path(
        "landfrichetype/",
        LandFricheTypeViewset.as_view(),
        name="landfrichetype",
    ),
    path(
        "landfrichestatut/",
        LandFricheStatutViewset.as_view(),
        name="landfrichestatut",
    ),
    path(
        "landfrichezonageenvironnementale/",
        LandFricheZonageEnvironnementaleViewset.as_view(),
        name="landfrichezonageenvironnementale",
    ),
    path(
        "landfrichezonagetype/",
        LandFricheZonageTypeViewset.as_view(),
        name="landfrichezonagetype",
    ),
    path(
        "landfrichesurfacerank/",
        LandFricheSurfaceRankViewset.as_view(),
        name="landfrichesurfacerank",
    ),
    path("landfriche/", LandFricheViewset.as_view(), name="landfriche"),
    path("landfrichegeojson/", LandFricheGeojsonViewset.as_view(), name="landfrichegeojson"),
    path("landfrichecentroid/", LandFricheCentroidViewset.as_view(), name="landfrichecentroid"),
    path("lands/", LandModelViewset.as_view({"get": "list"}), name="lands"),
    path("lands/<str:land_type>/<str:land_id>", LandModelViewset.as_view({"get": "retrieve"}), name="land"),
    path(
        "landsgeom/<str:land_type>/<str:land_id>", LandModelGeomViewset.as_view({"get": "retrieve"}), name="land_geom"
    ),
    path(
        "landsfullgeom/<str:land_type>/<str:land_id>",
        LandModelFullGeomViewset.as_view({"get": "retrieve"}),
        name="land_full_geom",
    ),
    path(
        "landchildrengeom/<str:land_type>/<str:land_id>/<str:child_land_type>",
        LandChildrenGeomViewset.as_view({"get": "retrieve"}),
        name="land_children_geom",
    ),
]
