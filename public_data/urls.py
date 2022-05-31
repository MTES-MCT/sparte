from django.urls import path
from rest_framework import routers

from .api.views import (
    ArtificialAreaViewSet,
    Artificialisee2015to2018ViewSet,
    Artificielle2018ViewSet,
    CommuneViewSet,
    CouvertureSolViewset,
    DepartementViewSet,
    EpciViewSet,
    OcsgeViewSet,
    OcsgeDiffViewSet,
    RegionViewSet,
    Renaturee2018to2015ViewSet,
    UsageSolViewset,
    ZoneConstruiteViewSet,
)

from .views import DisplayMatrix


app_name = "public_data"


urlpatterns = [
    path("matrix", DisplayMatrix.as_view(), name="matrix"),
]


router = routers.DefaultRouter()
router.register(r"artificialisee/2015to2018", Artificialisee2015to2018ViewSet)
router.register(r"artificielle/2018", Artificielle2018ViewSet)
router.register(r"communes", CommuneViewSet)
router.register(r"renaturee/2018to2015", Renaturee2018to2015ViewSet)
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
