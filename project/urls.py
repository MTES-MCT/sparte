from django.urls import path
from rest_framework import routers

from . import views
from .api_views import EmpriseViewSet, PlanEmpriseViewSet, ProjectViewSet


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
        "<int:pk>/tableau-de-bord/consommation",
        views.ProjectReportConsoView.as_view(),
        name="report_conso",
    ),
    path(
        "<int:pk>/tableau-de-bord/synthesis",
        views.ProjectReportSynthesisView.as_view(),
        name="report_synthesis",
    ),
    path(
        "<int:pk>/tableau-de-bord/couverture",
        views.ProjectReportCouvertureView.as_view(),
        name="report_couverture",
    ),
    path(
        "<int:pk>/tableau-de-bord/usage",
        views.ProjectReportUsageView.as_view(),
        name="report_usage",
    ),
    path(
        "<int:pk>/tableau-de-bord/artificialisation",
        views.ProjectReportArtifView.as_view(),
        name="report_artif",
    ),
    path(
        "<int:pk>/tableau-de-bord/telechargement",
        views.ProjectReportDownloadView.as_view(),
        name="report_download",
    ),
    path(
        "<int:pk>/tableau-de-bord/groupes-communes",
        views.ProjectReportCityGroupView.as_view(),
        name="report_city_group",
    ),
    path("<int:pk>/map", views.ProjectMapView.as_view(), name="map"),
    path(
        "<int:pk>/carte/comprendre-mon-artificialisation",
        views.MyArtifMapView.as_view(),
        name="theme-my-artif",
    ),
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
    # old creation journey
    path("diagnostic/etape/1", views.SelectPublicProjects.as_view(), name="select"),
    path("diagnostic/etape/1/city", views.SelectCities.as_view(), name="select-city"),
    # new creation journey
    path("diagnostic", views.SelectTypeView.as_view(), name="create-1"),
    path(
        "diagnostic/territoire/<slug:land_type>",
        views.SelectTerritoireView.as_view(),
        name="create-2",
    ),
    # path("diagnostic/dates", views.SetProjectOptions.as_view(), name="create-3"),
    path(
        "diagnostic/dates/<slug:public_keys>",
        views.SetProjectOptions.as_view(),
        name="create-3",
    ),
]


# Add API urls
router = routers.DefaultRouter()
router.register(r"geojson", EmpriseViewSet)
router.register(r"plan/geojson", PlanEmpriseViewSet)
router.register(r"projects", ProjectViewSet)


urlpatterns += router.urls
