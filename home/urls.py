from django.urls import path

from . import views

app_name = "home"


urlpatterns = [
    path("", views.HomeView.as_view(), name="home"),
    path("rapport-local", views.HomeRapportLocalView.as_view(), name="home_rapport_local"),
    path("telechargements", views.DownloadView.as_view(), name="downloads"),
    path("telechargements/rnu-package/<str:departement>", views.download_package_request, name="download_rnu_package"),
    path("mentions-legales", views.LegalNoticeView.as_view(), name="cgv"),
    path("confidentialité", views.PrivacyView.as_view(), name="privacy"),
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
    path("alive/async-workers", views.AliveView.as_view(), name="alive"),
]
