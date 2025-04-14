from django.urls import path
from django.views.generic.base import RedirectView
from rest_framework import routers

from . import views
from .api_views import EmpriseViewSet, ProjectDetailView

app_name = "project"


# See below for DRF's router inclusions

urlpatterns = [
    # ### PROJECTS ###
    # CREATE
    path("nouveau", views.CreateProjectViews.as_view(), name="create"),
    path("<int:pk>/en-construction", views.SplashScreenView.as_view(), name="splash"),
    path(
        "<int:pk>/en-construction/progress",
        views.SplashProgressionView.as_view(),
        name="splash-progress",
    ),
    # CRUD
    path("mes-diagnostics", views.ProjectListView.as_view(), name="list"),
    path("<int:pk>/", RedirectView.as_view(pattern_name="project:report_synthesis", permanent=True), name="home"),
    path("<int:pk>/detail", ProjectDetailView.as_view(), name="project-detail"),
    path("<int:pk>/ajouter", views.ClaimProjectView.as_view(), name="claim"),
    path("<int:pk>/edit", views.ProjectUpdateView.as_view(), name="update"),
    path("<int:pk>/delete/", views.ProjectDeleteView.as_view(), name="delete"),
    path("<int:pk>/ajouter-voisin", views.ProjectAddLookALike.as_view(), name="lookalike"),
    path(
        "<int:pk>/retirer-voisin",
        views.ProjectRemoveLookALike.as_view(),
        name="rm-lookalike",
    ),
    path(
        "<int:pk>/set_target_2031",
        views.ProjectSetTarget2031View.as_view(),
        name="set-target-2031",
    ),
    # REPORT
    path(
        route="<int:pk>/tableau-de-bord/artificialisation",
        view=views.diagnostic.DiagnosticArtificialisationView.as_view(),
        name="report_artif",
    ),
    path(
        route="<int:pk>/tableau-de-bord/impermeabilisation",
        view=views.diagnostic.DiagnosticImpermeabilisationView.as_view(),
        name="report_imper",
    ),
    path(
        "<int:pk>/tableau-de-bord/consommation",
        views.diagnostic.DiagnosticConsoView.as_view(),
        name="report_conso",
    ),
    path(
        "<int:pk>/tableau-de-bord/synthesis",
        views.diagnostic.DiagnosticSynthesisView.as_view(),
        name="report_synthesis",
    ),
    path(
        "<int:pk>/tableau-de-bord/vacance-des-logements",
        views.diagnostic.DiagnosticLogementVacantView.as_view(),
        name="report_logement_vacant",
    ),
    path(
        "<int:pk>/tableau-de-bord/trajectoires",
        views.diagnostic.DiagnosticTarget2031View.as_view(),
        name="report_target_2031",
    ),
    path(
        "<int:pk>/tableau-de-bord/rapport-local",
        views.diagnostic.DiagnostictRapportLocalView.as_view(),
        name="report_local",
    ),
    # REPORT PARTIALS
    path(
        "<int:pk>/target-2031-graphic",
        views.diagnostic.DiagnosticTarget2031GraphView.as_view(),
        name="target-2031-graphic",
    ),
    # MAP
    path(
        "<int:pk>/carte/consommation-villes-du-territoire",
        views.CitySpaceConsoMapView.as_view(),
        name="theme-city-conso",
    ),
    # DOWNLOAD
    path(
        "<int:pk>/tableau-de-bord/telechargement/<slug:requested_document>",
        views.diagnostic.DiagnosticDownloadWordView.as_view(),
        name="report_download",
    ),
    path(
        "<int:pk>/all_charts_for_preview",
        views.AllChartsForPreview.as_view(),
        name="all_charts_for_preview",
    ),
    path(
        "<int:request_id>/word/telechargement",
        views.diagnostic.DiagnosticDownloadWordView.as_view(),
        name="word_download",
    ),
]

# Add API urls
router = routers.DefaultRouter()
router.register(r"geojson", EmpriseViewSet)


urlpatterns += router.urls
