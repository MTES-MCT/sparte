from django.urls import path

from . import views


app_name = "carto"


urlpatterns = [
    path("vector", views.VectorView.as_view(), name="vector"),
]
