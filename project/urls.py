from django.urls import path
from rest_framework import routers

from . import views
from .api_views import EmpriseViewSet, PlanEmpriseViewSet


app_name = "project"


# See below for DRF's router inclusions

urlpatterns = [
    # ### PROJECTS ###
    path("", views.ProjectListView.as_view(), name="list"),
    path("add/", views.ProjectCreateView.as_view(), name="add"),
    path("<int:pk>/", views.ProjectDetailView.as_view(), name="detail"),
    path("<int:pk>/ajouter", views.ClaimProjectView.as_view(), name="claim"),
    path("<int:pk>/edit", views.ProjectUpdateView.as_view(), name="update"),
    path("<int:pk>/reinitialize", views.ProjectReinitView.as_view(), name="reinit"),
    path(
        "<int:pk>/ajouter/voisins",
        views.ProjectAddLookALike.as_view(),
        name="lookalike",
    ),
    path(
        "<int:pk>/tableau/de/bord/consommation",
        views.ProjectReportConsoView.as_view(),
        name="report",
    ),
    path(
        "<int:pk>/tableau/de/bord/synthesis",
        views.ProjectReportSynthesisView.as_view(),
        name="report_synthesis",
    ),
    path(
        "<int:pk>/tableau/de/bord/couverture",
        views.ProjectReportCouvertureView.as_view(),
        name="report_couverture",
    ),
    path(
        "<int:pk>/tableau/de/bord/usage",
        views.ProjectReportUsageView.as_view(),
        name="report_usage",
    ),
    path(
        "<int:pk>/report/artificialisation",
        views.ProjectReportArtifView.as_view(),
        name="report_artif",
    ),
    path(
        "<int:pk>/tableau/de/bord/telechargement",
        views.ProjectReportDownloadView.as_view(),
        name="report_download",
    ),
    path("<int:pk>/map", views.ProjectMapView.as_view(), name="map"),
    path("<int:pk>/delete/", views.ProjectDeleteView.as_view(), name="delete"),
    # ### PLANS ###
    path("plan/create/", views.PlanCreateView.as_view(), name="plan-create"),
    path("plan/", views.PlanListView.as_view(), name="plan-list"),
    path("plan/<int:pk>", views.PlanDetailView.as_view(), name="plan-detail"),
    path("plan/<int:pk>/delete", views.PlanDeleteView.as_view(), name="plan-delete"),
    path("plan/<int:pk>/update", views.PlanUpdateView.as_view(), name="plan-update"),
    # Shortcuts
    path(
        "<int:project_id>/plan/create",
        views.PlanCreateView.as_view(),
        name="project-plan-create",
    ),
    path(
        "<int:project_id>/plan/", views.PlanListView.as_view(), name="project-plan-list"
    ),
    path("diagnostic/etape/0", views.SelectTypeView.as_view()),
    path(
        "diagnostic/etape/choisir/region",
        views.SelectRegionView.as_view(),
        name="select-region",
    ),
    path("diagnostic/etape/1", views.SelectPublicProjects.as_view(), name="select"),
    path("diagnostic/etape/1/city", views.SelectCities.as_view(), name="select-city"),
    path("diagnostic/etape/2", views.SetProjectOptions.as_view(), name="select_2"),
]


# Add API urls
router = routers.DefaultRouter()
router.register(r"geojson", EmpriseViewSet)
router.register(r"plan/geojson", PlanEmpriseViewSet)


urlpatterns += router.urls
