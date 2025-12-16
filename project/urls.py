from django.urls import path
from django.views.generic.base import RedirectView
from rest_framework import routers

from project.models.create import create_project_api_view

from . import views
from .api_views import (
    EmpriseViewSet,
    ExportStartView,
    ExportStatusView,
    ProjectDetailView,
    RecordDownloadRequestAPIView,
)

app_name = "project"


# See below for DRF's router inclusions

urlpatterns = [
    # ### PROJECTS ###
    # CREATE
    path("nouveau", create_project_api_view, name="create"),
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
        "<int:pk>/tableau-de-bord/friches",
        views.diagnostic.DiagnosticFrichesView.as_view(),
        name="report_friches",
    ),
    path(
        "<int:pk>/tableau-de-bord/trajectoires",
        views.diagnostic.DiagnosticTrajectoiresView.as_view(),
        name="report_target_2031",
    ),
    path(
        "<int:pk>/tableau-de-bord/rapport-local",
        views.diagnostic.DiagnostictRapportLocalView.as_view(),
        name="report_local",
    ),
    # DOWNLOAD
    path(
        "<int:pk>/tableau-de-bord/telechargements",
        views.diagnostic.DiagnosticDownloadsView.as_view(),
        name="report_downloads",
    ),
    # Export PDF (polling)
    path("export/start/", ExportStartView.as_view(), name="export_start"),
    path("export/status/<str:job_id>/", ExportStatusView.as_view(), name="export_status"),
    path("export/download/<str:job_id>/", RecordDownloadRequestAPIView.as_view(), name="export_download"),
]

# Add API urls
router = routers.DefaultRouter()
router.register(r"geojson", EmpriseViewSet)


urlpatterns += router.urls
