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
    path("<int:pk>/edit", views.ProjectUpdateView.as_view(), name="update"),
    path("<int:pk>/reinitialize", views.ProjectReinitView.as_view(), name="reinit"),
    path("<int:pk>/report", views.ProjectReportView.as_view(), name="report"),
    path(
        "<int:pk>/report/synthesis",
        views.ProjectReportSynthesisView.as_view(),
        name="report_synthesis",
    ),
    path(
        "<int:pk>/report/couverture",
        views.ProjectReportCouvertureView.as_view(),
        name="report_artif",
    ),
    path(
        "<int:pk>/report/usage",
        views.ProjectReportUsageView.as_view(),
        name="report_usage",
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
    path("select/", views.SelectPublicProjects.as_view(), name="select"),
]


# Add API urls
router = routers.DefaultRouter()
router.register(r"geojson", EmpriseViewSet)
router.register(r"plan/geojson", PlanEmpriseViewSet)


urlpatterns += router.urls
