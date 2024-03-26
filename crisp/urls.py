from rest_framework import routers

from .views import CrispWebhookNotificationView

router = routers.DefaultRouter()
router.register(r"webhook-proxy", viewset=CrispWebhookNotificationView)

urlpatterns = router.urls
