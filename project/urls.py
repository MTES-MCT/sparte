from django.urls import path
from rest_framework import routers

from . import views
from .api_views import EmpriseViewSet, ProjectViewSet


app_name = "project"


# See below for DRF's router inclusions

urlpatterns = [
    # ### PROJECTS ###
    # CREATE
    path("nouveau", views.CreateProjectViews.as_view(), name="create"),
    # CRUD
    # REPORT
    # MAP
    path("", views.ProjectListView.as_view(), name="list"),
    path("<int:pk>/", views.ProjectDetailView.as_view(), name="detail"),
    path("<int:pk>/ajouter", views.ClaimProjectView.as_view(), name="claim"),
    path("<int:pk>/edit", views.ProjectUpdateView.as_view(), name="update"),
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
    path(
        "<int:pk>/tableau-de-bord/consommation-relative",
        views.ProjectReportConsoRelativeView.as_view(),
        name="report_conso_relative",
    ),
    path("<int:pk>/map", views.ProjectMapView.as_view(), name="map"),
    path(
        "<int:pk>/carte/comprendre-mon-artificialisation",
        views.MyArtifMapView.as_view(),
        name="theme-my-artif",
    ),
    path(
        "<int:pk>/carte/consomation-villes-du-territoire",
        views.CitySpaceConsoMapView.as_view(),
        name="theme-city-conso",
    ),
    path(
        "<int:pk>/carte/artificialisation-villes-du-territoire",
        views.CityArtifMapView.as_view(),
        name="theme-city-artif",
    ),
    path("<int:pk>/delete/", views.ProjectDeleteView.as_view(), name="delete"),
    # EXPORT
    path("exports/", views.ExportListView.as_view(), name="excel"),
]


# Add API urls
router = routers.DefaultRouter()
router.register(r"geojson", EmpriseViewSet)
router.register(r"projects", ProjectViewSet)


urlpatterns += router.urls
