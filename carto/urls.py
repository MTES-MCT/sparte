from django.urls import path
from django.views.generic import TemplateView

from . import views


app_name = "carto"

urlpatterns = [
    path("", TemplateView.as_view(template_name="base_connected.html"), name="home"),
    path("departements/", views.departements, name="departement"),
    path("data/departements/", views.data_departements, name="data_departement"),
    path("worldborders/", views.worldborder, name="worldborder"),
    path("data/worldborders/", views.data_worldborder, name="data_worldborder"),
    path(
        "arcachon/",
        TemplateView.as_view(template_name="base_connected.html"),
        name="arcachon",
    ),
]
