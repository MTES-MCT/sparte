from rest_framework import routers

from .api_views import CommunesSybarvalViewSet

router = routers.DefaultRouter()
router.register(r"communes_sybarvale", CommunesSybarvalViewSet)

urlpatterns = router.urls
