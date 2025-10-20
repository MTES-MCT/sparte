from django.http import FileResponse, Http404, JsonResponse
from django.urls import path

from project.api_views import UpdateProjectTarget2031APIView
from project.charts import (
    AnnualConsoByDeterminantChart,
    AnnualConsoByDeterminantChartExport,
    AnnualTotalConsoChart,
    AnnualTotalConsoChartExport,
    ConsoByDeterminantPieChart,
    ConsoByDeterminantPieChartExport,
    ObjectiveChart,
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
    ArtifNetFluxChart,
    ArtifSyntheseChart,
)
from project.charts.consommation import ConsoAnnualChart
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
)
from project.charts.demography.PopulationConsoProgressionChart import (
    PopulationConsoProgressionChart,
)
from project.charts.demography.PopulationDensityChart import PopulationDensityChart
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
)
from project.charts.ObjectiveChart import ObjectiveChart
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
    LogementVacantAutorisationLogementComparisonChart,
    LogementVacantAutorisationLogementRatioGaugeChart,
    LogementVacantAutorisationLogementRatioProgressionChart,
    LogementVacantConsoProgressionChart,
    LogementVacantProgressionChart,
    LogementVacantRatioProgressionChart,
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
    LandImperFluxViewset,
    LandImperStockCouvertureCompositionViewset,
    LandImperStockIndexViewset,
    LandImperStockUsageCompositionViewset,
    LandImperStockViewset,
    LandModel,
    LandModelGeomViewset,
    LandModelViewset,
    LandPopStatsViewset,
    SimilarTerritoriesViewset,
)
from public_data.models.urbanisme import LogementVacantAutorisationStatsViewset

app_name = "api"


def get_chart_klass_or_404(chart_id):
    charts = {
        "pie_artif_by_couverture": ArtifByCouverturePieChart,
        "pie_artif_by_couverture_export": ArtifByCouverturePieChartExport,
        "pie_imper_by_couverture": ImperByCouverturePieChart,
        "pie_imper_by_couverture_export": ImperByCouverturePieChartExport,
        "pie_artif_by_usage": ArtifByUsagePieChart,
        "pie_imper_by_usage": ImperByUsagePieChart,
        "artif_map": ArtifMap,
        "imper_map": ImperMap,
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
        "objective_chart": ObjectiveChart,
        "objective_chart_export": ObjectiveChart,
        "artif_synthese": ArtifSyntheseChart,
        "imper_synthese": ImperSyntheseChart,
        "artif_net_flux": ArtifNetFluxChart,
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
        "population_density_chart": PopulationDensityChart,
        "population_conso_progression_chart": PopulationConsoProgressionChart,
        "population_conso_comparison_chart": PopulationConsoComparisonChart,
        # Objective chart
        "objective_chart": ObjectiveChart,
        "objective_chart_export": ObjectiveChartExport,
        # Logement vacant charts
        "logement_vacant_progression_chart": LogementVacantProgressionChart,
        "logement_vacant_ratio_progression_chart": LogementVacantRatioProgressionChart,
        "logement_vacant_conso_progression_chart": LogementVacantConsoProgressionChart,
        "logement_vacant_autorisation_comparison_chart": LogementVacantAutorisationLogementComparisonChart,
        "logement_vacant_autorisation_ratio_gauge_chart": LogementVacantAutorisationLogementRatioGaugeChart,
        "logement_vacant_autorisation_ratio_progression_chart": LogementVacantAutorisationLogementRatioProgressionChart,  # noqa E501
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


def chart_view(request, id, land_type, land_id):
    land = LandModel.objects.get(land_type=land_type, land_id=land_id)

    chart_klass = get_chart_klass_or_404(id)
    chart_params = request.GET.dict()
    chart = chart_klass(land=land, params=chart_params)

    if "format" in chart_params and chart_params["format"] == "png":
        return chart_view_file_response(chart=chart, id=id, land_type=land_type, land_id=land_id)
    return chart_view_json_response(chart=chart)


urlpatterns = [
    path("project/<int:pk>/target-2031/", UpdateProjectTarget2031APIView.as_view(), name="update-target-2031"),
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
    path("landconsostats/", LandConsoStatsViewset.as_view(), name="consostats"),
    path("landpopstats/", LandPopStatsViewset.as_view(), name="popstats"),
    path("similarterritories/", SimilarTerritoriesViewset.as_view(), name="similarterritories"),
    path("artifzonageindex/", ArtifZonageIndexViewset.as_view(), name="artifzonageindex"),
    path("imperzonageindex/", ImperZonageIndexViewset.as_view(), name="imperzonageindex"),
    path("artifzonage/", ArtifZonageViewset.as_view(), name="artifzonageindex"),
    path("imperzonage/", ImperZonageViewset.as_view(), name="imperzonageindex"),
    path("landimperflux/", LandImperFluxViewset.as_view(), name="imperflux"),
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
]
