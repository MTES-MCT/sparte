from django.urls import path
from rest_framework import routers

from . import views
from .api_views import EmpriseViewSet, ProjectViewSet

app_name = "project"


# See below for DRF's router inclusions

urlpatterns = [
    # ### PROJECTS ###
    # CREATE
    path("nouveau", views.CreateProjectViews.as_view(), name="create"),
    path("<int:pk>/en-construction", views.SplashScreenView.as_view(), name="splash"),
    path(
        "<int:pk>/en-construction/progress",
        views.SplashProgressionView.as_view(),
        name="splash-progress",
    ),
    # CRUD
    path("", views.ProjectListView.as_view(), name="list"),
    path("<int:pk>/", views.ProjectReportSynthesisView.as_view(), name="detail"),
    path("<int:pk>/ajouter", views.ClaimProjectView.as_view(), name="claim"),
    path("<int:pk>/edit", views.ProjectUpdateView.as_view(), name="update"),
    path("<int:pk>/delete/", views.ProjectDeleteView.as_view(), name="delete"),
    path("<int:pk>/ajouter-voisin", views.ProjectAddLookALike.as_view(), name="lookalike"),
    path(
        "<int:pk>/retirer-voisin/<slug:public_key>",
        views.ProjectRemoveLookALike.as_view(),
        name="rm-lookalike",
    ),
    path(
        "<int:pk>/set-period",
        views.SetProjectPeriodView.as_view(),
        name="set-period",
    ),
    path(
        "<int:pk>/set_target_2031",
        views.ProjectSetTarget2031View.as_view(),
        name="set-target-2031",
    ),
    # REPORT
    path(
        "<int:pk>/tableau-de-bord/consommation",
        views.ProjectReportConsoView.as_view(),
        name="report_conso",
    ),
    path(
        "<int:pk>/tableau-de-bord/synthesis",
        views.ProjectReportSynthesisView.as_view(),
        name="report_synthesis",
    ),
    path(
        "<int:pk>/tableau-de-bord/découvrir-l-ocsge",
        views.ProjectReportDicoverOcsgeView.as_view(),
        name="report_discover",
    ),
    path(
        "<int:pk>/tableau-de-bord/impermeabilisation",
        views.ProjectReportImperView.as_view(),
        name="report_imper",
    ),
    path(
        "<int:pk>/tableau-de-bord/artificialisation",
        views.ProjectReportArtifView.as_view(),
        name="report_artif",
    ),
    path(
        "<int:pk>/tableau-de-bord/trajectoires",
        views.ProjectReportTarget2031View.as_view(),
        name="report_target_2031",
    ),
    path(
        "<int:pk>/tableau-de-bord/zonages-d-urbanisme",
        views.ProjectReportUrbanZonesView.as_view(),
        name="report_urban_zones",
    ),
    path(
        "<int:pk>/tableau-de-bord/zones-urbanismes",
        views.ProjectReportGpuView.as_view(),
        name="report_gpu",
    ),
    path(
        "<int:pk>/tableau-de-bord/rapport-local",
        views.ProjectReportLocalView.as_view(),
        name="report_local",
    ),
    # REPORT PARTIALS
    path(
        "<int:pk>/target-2031-graphic",
        views.ProjectReportTarget2031GraphView.as_view(),
        name="target-2031-graphic",
    ),
    path(
        "<int:pk>/tableau-de-bord/consommation-relative/surface",
        views.ConsoRelativeSurfaceChart.as_view(),
        name="relative-surface",
    ),
    path(
        "<int:pk>/tableau-de-bord/artificialisation/évolution-nette",
        views.ArtifNetChart.as_view(),
        name="artif-net-chart",
    ),
    path(
        "<int:pk>/tableau-de-bord/artificialisation/détail-couverture",
        views.ArtifDetailCouvChart.as_view(),
        name="artif-detail-couv-chart",
    ),
    path(
        "<int:pk>/tableau-de-bord/artificialisation/détail-usage",
        views.ArtifDetailUsaChart.as_view(),
        name="artif-detail-usa-chart",
    ),
    path(
        "<int:pk>/synthèse-des-zonages-d-urbanisme",
        views.ProjectReportGpuZoneSynthesisTable.as_view(),
        name="synthesis-zone-urba-all",
    ),
    path(
        "<int:pk>/zonages-d-urbanisme/carte-générale",
        views.ProjectReportGpuZoneGeneralMap.as_view(),
        name="zone-urba-general-map",
    ),
    path(
        "<int:pk>/zonages-d-urbanisme/carte-de-remplissage",
        views.ProjectReportGpuZoneFillMap.as_view(),
        name="zone-urba-fill-map",
    ),
    path(
        "<int:pk>/consommation/carte",
        views.ProjectReportConsoMap.as_view(),
        name="conso-map",
    ),
    path(
        "<int:pk>/artificialisation/carte-territoire",
        views.ProjectReportArtifTerritoryMap.as_view(),
        name="artif-territory-map",
    ),
    path(
        "<int:pk>/artificialisation/carte-villes",
        views.ProjectReportArtifCitiesMap.as_view(),
        name="artif-cities-map",
    ),
    # MAP
    path(
        "<int:pk>/carte/comprendre-mon-artificialisation",
        views.MyArtifMapView.as_view(),
        name="theme-my-artif",
    ),
    path(
        "<int:pk>/carte/consommation-villes-du-territoire",
        views.CitySpaceConsoMapView.as_view(),
        name="theme-city-conso",
    ),
    path(
        "<int:pk>/carte/artificialisation-villes-du-territoire",
        views.CityArtifMapView.as_view(),
        name="theme-city-artif",
    ),
    path(
        "<int:pk>/carte/zonages-d-urbanisme",
        views.UrbanZonesMapView.as_view(),
        name="map-urban-zones",
    ),
    path(
        "<int:pk>/map-test",
        views.MapTestView.as_view(),
        name="map-test",
    ),
    path(
        "<int:project_id>/carte/detail-zone-urbaine/<str:checksum>",
        views.ArtifZoneUrbaView.as_view(),
        name="map-pane-artif-zone-urba",
    ),
    # DOWNLOAD
    path(
        "<int:pk>/tableau-de-bord/telechargement/<slug:requested_document>",
        views.ProjectReportDownloadView.as_view(),
        name="report_download",
    ),
    path(
        "<int:pk>/all_charts_for_preview",
        views.AllChartsForPreview.as_view(),
        name="all_charts_for_preview",
    ),
    path(
        "<int:request_id>/word/telechargement",
        views.DownloadWordView.as_view(),
        name="word_download",
    ),
    # EXPORT
    path("exports/", views.ExportListView.as_view(), name="excel"),
    path("<int:pk>/export-excel", views.ExportExcelView.as_view(), name="export-excel"),
    # SUB APPS
    path("test", views.TestView.as_view(), name="test"),
]


# Add API urls
router = routers.DefaultRouter()
router.register(r"geojson", EmpriseViewSet)
router.register(r"projects", ProjectViewSet)


urlpatterns += router.urls
