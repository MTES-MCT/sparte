from django.urls import path
from rest_framework import routers

from public_data import views

app_name = "public_data"


urlpatterns = [
    path("matrix", views.DisplayMatrix.as_view(), name="matrix"),
    path("grid", views.grid_view.as_view(), name="grid"),
    path("search-land", views.SearchLandApiView.as_view({"post": "post"}), name="search-land"),
]


router = routers.DefaultRouter()
router.register(r"referentiel/couverture-sol", views.CouvertureSolViewset)
router.register(r"referentiel/usage-sol", views.UsageSolViewset)
router.register(r"ocsge/general", views.OcsgeViewSet)
router.register(r"ocsge/diff", views.OcsgeDiffViewSet)
router.register(r"ocsge/diff-centroids", views.OcsgeDiffCentroidViewSet, basename="ocsgeDiffCentroids")
router.register(r"ocsge/zones-artificielles", views.ArtificialAreaViewSet)
router.register(r"departements", views.DepartementViewSet)
router.register(r"referentiel/zones-urbaines", views.ZoneUrbaViewSet)

urlpatterns += router.urls
