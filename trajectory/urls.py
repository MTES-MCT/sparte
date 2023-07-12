from django.urls import path

from trajectory import views

app_name = "trajectory"


urlpatterns = [
    path(
        "",
        views.ProjectReportTrajectoryView.as_view(),
        name="home",
    ),
    path(
        "consommation",
        views.ProjectReportTrajectoryConsumptionView.as_view(),
        name="partial-form-consumption",
    ),
    path(
        "graphique",
        views.ProjectReportTrajectoryGraphView.as_view(),
        name="partial-graphic",
    ),
    path(
        "set-target-2031",
        views.SetTargetView.as_view(),
        name="set_target_2031",
    ),
]
