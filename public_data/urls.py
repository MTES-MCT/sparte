from django.urls import path
from rest_framework import routers

from .api.views import (
    ArtificialAreaViewSet,
    CommuneViewSet,
    CouvertureSolViewset,
    DepartementViewSet,
    EpciViewSet,
    OcsgeDiffViewSet,
    OcsgeViewSet,
    RegionViewSet,
    UsageSolViewset,
    ZoneConstruiteViewSet,
)
from .views import DisplayMatrix

app_name = "public_data"


urlpatterns = [
    path("matrix", DisplayMatrix.as_view(), name="matrix"),
]


router = routers.DefaultRouter()
router.register(r"communes", CommuneViewSet)
router.register(r"referentiel/couverture-sol", CouvertureSolViewset)
router.register(r"referentiel/usage-sol", UsageSolViewset)
router.register(r"ocsge/general", OcsgeViewSet)
router.register(r"ocsge/diff", OcsgeDiffViewSet)
router.register(r"ocsge/zones-construites", ZoneConstruiteViewSet)
router.register(r"ocsge/zones-artificielles", ArtificialAreaViewSet)
router.register(r"referentiel/region", RegionViewSet)
router.register(r"referentiel/departement", DepartementViewSet)
router.register(r"referentiel/epci", EpciViewSet)

urlpatterns += router.urls
