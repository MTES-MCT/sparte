from django.urls import path

from . import views

app_name = "home"


urlpatterns = [
    path("", views.HomeView.as_view(), name="home"),
    path("rapport-local", views.HomeRapportLocalView.as_view(), name="home_rapport_local"),
    path("mentions-legales", views.LegalNoticeView.as_view(), name="cgv"),
    path("confidentialité", views.PrivacyView.as_view(), name="privacy"),
    path("accessibilite", views.AccessView.as_view(), name="accessibilite"),
    path("robots.txt", views.RobotView.as_view(), name="robots"),
    path("contact", views.ContactView.as_view(), name="contact"),
    path("satisfaction", views.SatisfactionView.as_view(), name="satisfaction"),
    path("statistiques", views.StatsView.as_view(), name="stats"),
    path(
        "newsletter/inscription",
        views.NewsletterSubscriptionView.as_view(),
        name="nwl-subscription",
    ),
    path(
        "newsletter/confirmation",
        views.NewsletterConfirmationSubscriptionView.as_view(),
        name="nwl-confirmation",
    ),
    path(
        "newsletter/confirmation/<slug:token>",
        views.NewsletterEmailValidationView.as_view(),
        name="nwl-validation",
    ),
    path("maintenance", views.MaintenanceView.as_view(), name="maintenance_mode"),
    path("alive/async-workers", views.AliveView.as_view(), name="alive"),
]
