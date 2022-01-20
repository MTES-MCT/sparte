from django.urls import path

from . import views


app_name = "carto"

urlpatterns = [
    path("", views.HomeConnected.as_view(), name="home_connected"),
    path("select/", views.SelectTerritory.as_view(), name="select"),
]
