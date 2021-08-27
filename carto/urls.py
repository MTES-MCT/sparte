from django.urls import path

from . import views


app_name = "carto"

urlpatterns = [
    path("", views.HomeConnected.as_view(), name="home_connected"),
    path("departements/", views.departements, name="departement"),
    path("data/departements/", views.data_departements, name="data_departement"),
    path("worldborders/", views.worldborder, name="worldborder"),
    path("data/worldborders/", views.data_worldborder, name="data_worldborder"),
    path("arcachon/", views.arcachon, name="arcachon"),
]
