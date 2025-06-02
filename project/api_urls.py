from django.http import Http404, JsonResponse
from django.urls import path

from project.charts.artificialisation import (
    ArtifByCouverturePieChart,
    ArtifByUsagePieChart,
    ArtifMap,
)
from public_data.models import (
    ArtifZonageIndexViewset,
    ArtifZonageViewset,
    LandArtifStockCouvertureCompositionViewset,
    LandArtifStockIndexViewset,
    LandArtifStockUsageCompositionViewset,
    LandArtifStockViewset,
    LandFrichePollutionViewset,
    LandFricheStatutViewset,
    LandFricheSurfaceRankViewset,
    LandFricheTypeViewset,
    LandFricheZonageEnvironnementaleViewset,
    LandFricheZonageTypeViewset,
    LandFricheZoneActiviteViewset,
    LandModel,
    LandModelViewset,
)

app_name = "api"


def get_chart_klass_or_404(chart_id):
    charts = {
        "pie_artif_by_couverture": ArtifByCouverturePieChart,
        "pie_artif_by_usage": ArtifByUsagePieChart,
        "artif_map": ArtifMap,
    }

    if chart_id not in charts:
        raise Http404(f"Chart {chart_id} not found, possible values are {list(charts.keys())}")

    return charts[chart_id]


def chart_view(request, id, land_type, land_id, *args, **kwargs):
    land = LandModel.objects.get(land_type=land_type, land_id=land_id)
    chart_klass = get_chart_klass_or_404(id)
    chart_params = request.GET.dict()
    chart = chart_klass(land=land, params=chart_params)
    data = {
        "highcharts_options": chart.chart,
        "data_table": chart.data_table,
    }
    return JsonResponse(data=data)


urlpatterns = [
    path("chart/<str:id>/<str:land_type>/<str:land_id>", chart_view, name="chart"),
    path("landartifstock/", LandArtifStockViewset.as_view(), name="artifstock"),
    path("landartifstockindex/", LandArtifStockIndexViewset.as_view(), name="artifstockindex"),
    path("artifzonageindex/", ArtifZonageIndexViewset.as_view(), name="artifzonageindex"),
    path("artifzonage/", ArtifZonageViewset.as_view(), name="artifzonageindex"),
    path(
        "landartifstockcouverturecomposition/",
        LandArtifStockCouvertureCompositionViewset.as_view(),
        name="artifstockcouverturecomposition",
    ),
    path(
        "landartifstockusagecomposition/",
        LandArtifStockUsageCompositionViewset.as_view(),
        name="artifstockusagecomposition",
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
    path("lands/", LandModelViewset.as_view({"get": "list"}), name="lands"),
    path("lands/<str:land_type>/<str:land_id>", LandModelViewset.as_view({"get": "retrieve"}), name="land"),
]
