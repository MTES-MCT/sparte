from django.urls import path

from trajectory import views

app_name = "trajectory"


urlpatterns = [
    path(
        "<int:pk>/tableau-de-bord/trajectoires",
        views.ProjectReportTrajectoryView.as_view(),
        name="home",
    ),
    path(
        "<int:pk>/tableau-de-bord/trajectoires/selectionne-période",
        views.ProjectReportTrajectoryPeriodView.as_view(),
        name="partial-form-period",
    ),
    path(
        "<int:pk>/tableau-de-bord/trajectoires/consommation/<int:start>/<int:end>",
        views.ProjectReportTrajectoryConsumptionView.as_view(),
        name="partial-form-consumption",
    ),
]
