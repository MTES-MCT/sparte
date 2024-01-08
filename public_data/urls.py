from django.urls import path
from rest_framework import routers

from public_data.api.search import SearchLandApiView

from .api.views import (
    ArtificialAreaViewSet,
    CommuneViewSet,
    CouvertureSolViewset,
    DepartementViewSet,
    EpciViewSet,
    OcsgeDiffCentroidViewSet,
    OcsgeDiffViewSet,
    OcsgeViewSet,
    RegionViewSet,
    ScotViewSet,
    UsageSolViewset,
    ZoneConstruiteViewSet,
    ZoneUrbaViewSet,
    grid_views,
)
from .views import DisplayMatrix

app_name = "public_data"


urlpatterns = [
    path("matrix", DisplayMatrix.as_view(), name="matrix"),
    path("grid", grid_views, name="grid"),
    path("search-land", SearchLandApiView.as_view(), name="search-land"),
]


router = routers.DefaultRouter()
router.register(r"communes", CommuneViewSet)
router.register(r"referentiel/couverture-sol", CouvertureSolViewset)
router.register(r"referentiel/usage-sol", UsageSolViewset)
router.register(r"ocsge/general", OcsgeViewSet)
router.register(r"ocsge/diff", OcsgeDiffViewSet)
router.register(r"ocsge/diff-centroids", OcsgeDiffCentroidViewSet, basename="ocsgeDiffCentroids")
router.register(r"ocsge/zones-construites", ZoneConstruiteViewSet)
router.register(r"ocsge/zones-artificielles", ArtificialAreaViewSet)
router.register(r"referentiel/region", RegionViewSet)
router.register(r"referentiel/departement", DepartementViewSet)
router.register(r"referentiel/epci", EpciViewSet)
router.register(r"referentiel/scot", ScotViewSet)
router.register(r"referentiel/zones-urbaines", ZoneUrbaViewSet)

urlpatterns += router.urls
