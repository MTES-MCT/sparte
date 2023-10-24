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
    path("robots.txt", views.RobotView.as_view(), name="robots"),
    path("contact", views.ContactView.as_view(), name="contact"),
    path(
        "newsletter/inscription",
        views.NewsletterSubscriptionView.as_view(),
        name="nwl-subscription",
    ),
    path(
        "newsletter/confirmation/<slug:token>",
        views.NewsLetterConfirmationView.as_view(),
        name="nwl-confirmation",
    ),
    path(
        "emails",
        views.AllEmailsView.as_view(),
        name="all-emails",
    ),
    path("maintenance", views.MaintenanceView.as_view(), name="maintenance_mode"),
]

router = routers.DefaultRouter()
router.register(r"stats/region", RegionViewSet)
urlpatterns += router.urls
