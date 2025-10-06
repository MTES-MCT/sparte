from django.http import FileResponse, Http404, JsonResponse
from django.urls import path

from project.charts.artificialisation import (
    ArtifByCouverturePieChart,
    ArtifByUsagePieChart,
    ArtifMap,
    ArtifSyntheseChart,
)
from project.charts.consommation import ConsoAnnualChart
from project.charts.impermeabilisation import (
    ImperByCouverturePieChart,
    ImperByUsagePieChart,
    ImperFluxByCouverture,
    ImperFluxByCouvertureExport,
    ImperFluxByUsage,
    ImperFluxByUsageExport,
    ImperMap,
    ImperNetFluxChart,
    ImperSyntheseChart,
)
from project.charts.urbanisme import (
    FrichePollutionChart,
    FricheSurfaceChart,
    FricheTypeChart,
    FricheZonageEnvironnementalChart,
    FricheZonageTypeChart,
    FricheZoneActiviteChart,
)
from public_data.models import (
    ArtifZonageIndexViewset,
    ArtifZonageViewset,
    ImperZonageIndexViewset,
    ImperZonageViewset,
    LandArtifStockCouvertureCompositionViewset,
    LandArtifStockIndexViewset,
    LandArtifStockUsageCompositionViewset,
    LandArtifStockViewset,
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
)

app_name = "api"


def get_chart_klass_or_404(chart_id):
    charts = {
        "pie_artif_by_couverture": ArtifByCouverturePieChart,
        "pie_imper_by_couverture": ImperByCouverturePieChart,
        "pie_artif_by_usage": ArtifByUsagePieChart,
        "pie_imper_by_usage": ImperByUsagePieChart,
        "artif_map": ArtifMap,
        "imper_map": ImperMap,
        "friche_pollution": FrichePollutionChart,
        "friche_surface": FricheSurfaceChart,
        "friche_type": FricheTypeChart,
        "friche_zonage_environnemental": FricheZonageEnvironnementalChart,
        "friche_zonage_type": FricheZonageTypeChart,
        "friche_zone_activite": FricheZoneActiviteChart,
        "conso_annual": ConsoAnnualChart,
        "artif_synthese": ArtifSyntheseChart,
        "imper_synthese": ImperSyntheseChart,
        "imper_net_flux": ImperNetFluxChart,
        "imper_flux_by_couverture": ImperFluxByCouverture,
        "imper_flux_by_couverture_export": ImperFluxByCouvertureExport,
        "imper_flux_by_usage": ImperFluxByUsage,
        "imper_flux_by_usage_export": ImperFluxByUsageExport,
    }

    if chart_id not in charts:
        raise Http404(f"Chart {chart_id} not found, possible values are {list(charts.keys())}")

    return charts[chart_id]


def chart_view_json_response(chart):
    return JsonResponse(
        data={
            "highcharts_options": chart.chart,
            "data_table": chart.data_table,
        }
    )


def chart_view_file_response(chart, id, land_type, land_id):
    return FileResponse(
        open(chart.get_temp_image(width=chart.print_width), "rb"),
        filename=f"{id}_{land_type}_{land_id}.png",
        as_attachment=False,
    )


def chart_view(request, id, land_type, land_id, *args, **kwargs):
    land = LandModel.objects.get(land_type=land_type, land_id=land_id)
    chart_klass = get_chart_klass_or_404(id)
    chart_params = request.GET.dict()
    chart = chart_klass(land=land, params=chart_params)

    if "format" in chart_params and chart_params["format"] == "png":
        return chart_view_file_response(chart=chart, id=id, land_type=land_type, land_id=land_id)
    return chart_view_json_response(chart=chart)


urlpatterns = [
    path("chart/<str:id>/<str:land_type>/<str:land_id>", chart_view, name="chart"),
    path("landartifstock/", LandArtifStockViewset.as_view(), name="artifstock"),
    path("landimperstock/", LandImperStockViewset.as_view(), name="imperstock"),
    path("landartifstockindex/", LandArtifStockIndexViewset.as_view(), name="artifstockindex"),
    path("landimperstockindex/", LandImperStockIndexViewset.as_view(), name="imperstockindex"),
    path("artifzonageindex/", ArtifZonageIndexViewset.as_view(), name="artifzonageindex"),
    path("imperzonageindex/", ImperZonageIndexViewset.as_view(), name="imperzonageindex"),
    path("artifzonage/", ArtifZonageViewset.as_view(), name="artifzonageindex"),
    path("imperzonage/", ImperZonageViewset.as_view(), name="imperzonageindex"),
    path("landimperflux/", LandImperFluxViewset.as_view(), name="imperflux"),
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
