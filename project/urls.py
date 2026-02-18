from django.urls import path
from rest_framework import routers

from . import views
from .api_views import (
    EmpriseViewSet,
    ExportStartView,
    ExportStatusView,
    RecordDownloadRequestAPIView,
)

app_name = "project"


# See below for DRF's router inclusions

urlpatterns = [
    path("mes-diagnostics", views.ProjectListView.as_view(), name="list"),
    # Export PDF (polling) — must be before <str:land_type>/<str:land_slug> routes
    path("export/start/", ExportStartView.as_view(), name="export_start"),
    path("export/status/<str:job_id>/", ExportStatusView.as_view(), name="export_status"),
    path("export/download/<str:job_id>/", RecordDownloadRequestAPIView.as_view(), name="export_download"),
    path("<str:land_type>/<str:land_slug>/", views.diagnostic.DiagnosticSynthesisView.as_view(), name="home"),
    # REPORT
    path(
        route="<str:land_type>/<str:land_slug>/artificialisation",
        view=views.diagnostic.DiagnosticArtificialisationView.as_view(),
        name="report_artif",
    ),
    path(
        route="<str:land_type>/<str:land_slug>/impermeabilisation",
        view=views.diagnostic.DiagnosticImpermeabilisationView.as_view(),
        name="report_imper",
    ),
    path(
        "<str:land_type>/<str:land_slug>/consommation",
        views.diagnostic.DiagnosticConsoView.as_view(),
        name="report_conso",
    ),
    path(
        "<str:land_type>/<str:land_slug>/vacance-des-logements",
        views.diagnostic.DiagnosticLogementVacantView.as_view(),
        name="report_logement_vacant",
    ),
    path(
        "<str:land_type>/<str:land_slug>/friches",
        views.diagnostic.DiagnosticFrichesView.as_view(),
        name="report_friches",
    ),
    path(
        "<str:land_type>/<str:land_slug>/trajectoires",
        views.diagnostic.DiagnosticTrajectoiresView.as_view(),
        name="report_target_2031",
    ),
    path(
        "<str:land_type>/<str:land_slug>/rapport-local",
        views.diagnostic.DiagnostictRapportLocalView.as_view(),
        name="report_local",
    ),
    # DOWNLOAD
    path(
        "<str:land_type>/<str:land_slug>/telechargements",
        views.diagnostic.DiagnosticDownloadsView.as_view(),
        name="report_downloads",
    ),
    path(
        "<str:land_type>/<str:land_slug>/telechargements/<uuid:draft_id>",
        views.diagnostic.DiagnosticDownloadsView.as_view(),
        name="report_downloads_draft",
    ),
]

# Add API urls
router = routers.DefaultRouter()
router.register(r"geojson", EmpriseViewSet)


urlpatterns += router.urls
