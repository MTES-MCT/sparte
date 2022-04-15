from django.urls import path
from rest_framework import routers

from .api_views import (
    Artificialisee2015to2018ViewSet,
    Artificielle2018ViewSet,
    CommuneViewSet,
    CouvertureSolViewset,
    DepartementViewSet,
    EnveloppeUrbaine2018ViewSet,
    EpciViewSet,
    OcsgeViewSet,
    RegionViewSet,
    Renaturee2018to2015ViewSet,
    SybarvalViewSet,
    UsageSolViewset,
    Voirie2018ViewSet,
    ZonesBaties2018ViewSet,
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
router.register(r"urbain/2018", EnveloppeUrbaine2018ViewSet)
router.register(r"renaturee/2018to2015", Renaturee2018to2015ViewSet)
router.register(r"global", SybarvalViewSet)
router.register(r"voirie/2018", Voirie2018ViewSet)
router.register(r"batie/2018", ZonesBaties2018ViewSet)
router.register(r"referentiel/couverture-sol", CouvertureSolViewset)
router.register(r"referentiel/usage-sol", UsageSolViewset)
router.register(r"ocsge", OcsgeViewSet)

router.register(r"referentiel/region", RegionViewSet)
router.register(r"referentiel/departement", DepartementViewSet)
router.register(r"referentiel/epci", EpciViewSet)

urlpatterns += router.urls
