from django.urls import path

from public_data import views

app_name = "public_data"


urlpatterns = [
    path("grid", views.grid_view.as_view(), name="grid"),
    path("search-land", views.SearchLandApiView.as_view({"post": "post"}), name="search-land"),
    path(
        "national-map/base-map",
        views.NationalMapBaseMapView.as_view(),
        name="national-map-base-map",
    ),
    path(
        "national-map/indicators",
        views.NationalMapIndicatorsView.as_view(),
        name="national-map-indicators",
    ),
]
