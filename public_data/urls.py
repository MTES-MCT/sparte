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
router.register(r"sybarval/artificialisee/2015to2018", Artificialisee2015to2018ViewSet)
router.register(r"sybarval/artificielle/2018", Artificielle2018ViewSet)
router.register(r"sybarval/communes", CommunesSybarvalViewSet)
router.register(r"sybarval/urbain/2018", EnveloppeUrbaine2018ViewSet)
router.register(r"sybarval/renaturee/2018to2015", Renaturee2018to2015ViewSet)
router.register(r"sybarval/global", SybarvalViewSet)
router.register(r"sybarval/voirie/2018", Voirie2018ViewSet)
router.register(r"sybarval/batie/2018", ZonesBaties2018ViewSet)

urlpatterns = router.urls
