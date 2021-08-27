from rest_framework import routers

from .api_views import (
    Artificialisee2015to2018ViewSet,
    Artificielle2018ViewSet,
    CommunesSybarvalViewSet,
    EnveloppeUrbaine2018ViewSet,
    Renaturee2018to2015ViewSet,
    SybarvalViewSet,
    Voirie2018ViewSet,
    ZonesBaties2018ViewSet,
)

app_name = "public_data"

router = routers.DefaultRouter()
router.register(r"sybarvale/artificialisee/2015to2018", Artificialisee2015to2018ViewSet)
router.register(r"sybarvale/artificielle/2018", Artificielle2018ViewSet)
router.register(r"sybarvale/communes", CommunesSybarvalViewSet)
router.register(r"sybarvale/urbain/2018", EnveloppeUrbaine2018ViewSet)
router.register(r"sybarvale/renaturee/2018to2015", Renaturee2018to2015ViewSet)
router.register(r"sybarvale/global", SybarvalViewSet)
router.register(r"sybarvale/voirie/2018", Voirie2018ViewSet)
router.register(r"sybarvale/batie/2018", ZonesBaties2018ViewSet)

urlpatterns = router.urls
