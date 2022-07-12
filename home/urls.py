from django.urls import path
from rest_framework import routers

from . import views
from .api.views import RegionViewSet

app_name = "home"


urlpatterns = [
    path("", views.Home.as_view(), name="home"),
    path(
        "faq/<slug:slug>/",
        views.FrequentlyAskedQuestionDetail.as_view(),
        name="faq-detail",
    ),
    path("cgu", views.LegalNotice.as_view(), name="cgv"),
    path("confidentialité", views.Privacy.as_view(), name="privacy"),
    path("stats", views.Stats.as_view(), name="stats"),
    path("robots.txt", views.RobotView.as_view(), name="robots"),
]

router = routers.DefaultRouter()
router.register(r"stats/region", RegionViewSet)
urlpatterns += router.urls
