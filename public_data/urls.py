from django.urls import path

from public_data import views

app_name = "public_data"


urlpatterns = [
    path("grid", views.grid_view.as_view(), name="grid"),
    path("search-land", views.SearchLandApiView.as_view({"post": "post"}), name="search-land"),
]
