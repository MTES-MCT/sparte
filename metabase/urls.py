from django.urls import path

from metabase import views

app_name = "metabase"


urlpatterns = [
    path("", views.StatsView.as_view(), name="stats"),
]
