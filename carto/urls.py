from django.urls import path

from . import views


app_name = "carto"

urlpatterns = [
    path("", views.HomeConnected.as_view(), name="home_connected"),
    path("arcachon/", views.arcachon, name="arcachon"),
    path("ocsge/2015/", views.Ocsge2015MapView.as_view(), name="ocsge-2015"),
    path("ocsge/", views.OcsgeMapViewSet.as_view(), name="ocsge"),
]
