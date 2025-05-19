from django.urls import path
from rest_framework import routers

from public_data import views

app_name = "public_data"


urlpatterns = [
    path("grid", views.grid_view.as_view(), name="grid"),
    path("search-land", views.SearchLandApiView.as_view({"post": "post"}), name="search-land"),
]


router = routers.DefaultRouter()
router.register(r"departements", views.DepartementViewSet)
router.register(r"referentiel/zones-urbaines", views.ZoneUrbaViewSet)

urlpatterns += router.urls
