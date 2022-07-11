from django.urls import path
from rest_framework import routers

from . import views
from .api.views import RegionViewSet

app_name = "home"


urlpatterns = [
    path("", views.HomeView.as_view(), name="home"),
    path("mentions-legales", views.LegalNoticeView.as_view(), name="cgv"),
    path("confidentialité", views.PrivacyView.as_view(), name="privacy"),
    path("stats", views.StatsView.as_view(), name="stats"),
    path("test", views.TestView.as_view(), name="test"),
    path("accessibilite", views.AccessView.as_view(), name="accessibilite"),
]

router = routers.DefaultRouter()
router.register(r"stats/region", RegionViewSet)
urlpatterns += router.urls
