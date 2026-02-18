from django.urls import path
from rest_framework import routers

from project.models.create import create_project_api_view

from . import views
from .api_views import (
    EmpriseViewSet,
    ExportStartView,
    ExportStatusView,
    ProjectDetailView,
    ProjectDownloadLinkView,
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
    path("<str:land_type>/<str:land_id>/", views.diagnostic.DiagnosticSynthesisView.as_view(), name="home"),
    path("<int:pk>/detail", ProjectDetailView.as_view(), name="project-detail"),
    path("<int:pk>/ajouter", views.ClaimProjectView.as_view(), name="claim"),
    # REPORT
    path(
        route="<str:land_type>/<str:land_id>/artificialisation",
        view=views.diagnostic.DiagnosticArtificialisationView.as_view(),
        name="report_artif",
    ),
    path(
        route="<str:land_type>/<str:land_id>/impermeabilisation",
        view=views.diagnostic.DiagnosticImpermeabilisationView.as_view(),
        name="report_imper",
    ),
    path(
        "<str:land_type>/<str:land_id>/consommation",
        views.diagnostic.DiagnosticConsoView.as_view(),
        name="report_conso",
    ),
    path(
        "<str:land_type>/<str:land_id>/vacance-des-logements",
        views.diagnostic.DiagnosticLogementVacantView.as_view(),
        name="report_logement_vacant",
    ),
    path(
        "<str:land_type>/<str:land_id>/friches",
        views.diagnostic.DiagnosticFrichesView.as_view(),
        name="report_friches",
    ),
    path(
        "<str:land_type>/<str:land_id>/trajectoires",
        views.diagnostic.DiagnosticTrajectoiresView.as_view(),
        name="report_target_2031",
    ),
    path(
        "<str:land_type>/<str:land_id>/rapport-local",
        views.diagnostic.DiagnostictRapportLocalView.as_view(),
        name="report_local",
    ),
    # DOWNLOAD
    path(
        "<str:land_type>/<str:land_id>/telechargements",
        views.diagnostic.DiagnosticDownloadsView.as_view(),
        name="report_downloads",
    ),
    path(
        "<str:land_type>/<str:land_id>/telechargements/<uuid:draft_id>",
        views.diagnostic.DiagnosticDownloadsView.as_view(),
        name="report_downloads_draft",
    ),
    path(
        "<int:pk>/telechargement-liens",
        ProjectDownloadLinkView.as_view(),
        name="report_download_url",
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
