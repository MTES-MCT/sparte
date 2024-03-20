from rest_framework import routers

from .api_views_v2 import ProjectNewViewset

app_name = "project_v2"

urlpatterns = []

router = routers.DefaultRouter()
router.register(r"projects", ProjectNewViewset, basename="projects_v2")

urlpatterns += router.urls
