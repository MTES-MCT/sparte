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
        "/selectionne-période",
        views.ProjectReportTrajectoryPeriodView.as_view(),
        name="partial-form-period",
    ),
    path(
        "/consommation/<int:start>/<int:end>",
        views.ProjectReportTrajectoryConsumptionView.as_view(),
        name="partial-form-consumption",
    ),
]
