from django.http import Http404, JsonResponse
from django.urls import path

from project.charts.artificialisation import (
    ArtifByCouverturePieChart,
    ArtifByUsagePieChart,
    ArtifStock,
)
from public_data.models import (
    ArtifZonageIndexViewset,
    ArtifZonageViewset,
    Land,
    LandArtifStockCouvertureCompositionViewset,
    LandArtifStockUsageCompositionViewset,
    LandArtifStockViewset,
    LandModelViewset,
)

app_name = "api"


def get_land_or_404(land_type, land_id):
    land_key = f"{land_type}_{land_id}"
    try:
        return Land(land_key)
    except Exception as e:
        raise Http404("Could not find land" + str(e))


def get_chart_klass_or_404(chart_id):
    charts = {
        "bar_artif_stock": ArtifStock,
        "pie_artif_by_couverture": ArtifByCouverturePieChart,
        "pie_artif_by_usage": ArtifByUsagePieChart,
    }

    if chart_id not in charts:
        raise Http404(f"Chart {chart_id} not found, possible values are {list(charts.keys())}")

    return charts[chart_id]


def chart_view(request, id, land_type, land_id, *args, **kwargs):
    land = get_land_or_404(land_type, land_id)
    chart_klass = get_chart_klass_or_404(id)
    chart_params = request.GET.dict()
    return JsonResponse(data=chart_klass(land=land, params=chart_params).chart)


urlpatterns = [
    path("chart/<str:id>/<str:land_type>/<str:land_id>", chart_view, name="chart"),
    path("landartifstock/", LandArtifStockViewset.as_view(), name="artifstock"),
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
    path("lands/", LandModelViewset.as_view({"get": "list"}), name="lands"),
    path("lands/<str:land_type>/<str:land_id>", LandModelViewset.as_view({"get": "retrieve"}), name="land"),
]
