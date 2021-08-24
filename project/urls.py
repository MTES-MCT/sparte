from django.urls import path
from rest_framework import routers

from . import views
from .api_views import EmpriseViewSet


app_name = "project"


router = routers.DefaultRouter()
router.register(r"geojson", EmpriseViewSet)


urlpatterns = [
    path("", views.ProjectListView.as_view(), name="list"),
    path("add/", views.ProjectCreateView.as_view(), name="add"),
    path("<int:pk>/", views.ProjectUpdateView.as_view(), name="update"),
    path("<int:pk>/delete/", views.ProjectDeleteView.as_view(), name="delete"),
] + router.urls
