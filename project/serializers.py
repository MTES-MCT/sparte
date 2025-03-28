from django.templatetags.static import static
from django.urls import reverse
from django_app_parameter.models import Parameter
from rest_framework import serializers
from rest_framework.serializers import SerializerMethodField
from rest_framework_gis import serializers as gis_serializers
from rest_framework_gis.serializers import GeometrySerializerMethodField

from project.models import Project
from public_data.models import Commune

from .models import Emprise


class ProjectDetailSerializer(gis_serializers.GeoModelSerializer):
    emprise = GeometrySerializerMethodField()
    bounds = SerializerMethodField()
    max_bounds = SerializerMethodField()
    centroid = SerializerMethodField()
    departements = SerializerMethodField()
    urls = SerializerMethodField()
    navbar = SerializerMethodField()
    footer = SerializerMethodField()
    header = SerializerMethodField()

    def get_urls(self, obj):
        kwargs = {"pk": obj.id}
        return {
            "synthese": reverse("project:report_synthesis", kwargs=kwargs),
            "rapportLocal": reverse("project:report_local", kwargs=kwargs),
            "trajectoires": reverse("project:report_target_2031", kwargs=kwargs),
            "consommation": reverse("project:report_conso", kwargs=kwargs),
            "logementVacant": reverse("project:report_logement_vacant", kwargs=kwargs),
            "update": reverse("project:update", kwargs=kwargs),
            "dowloadConsoReport": reverse(
                "project:report_download", kwargs={"requested_document": "rapport-conso", **kwargs}
            ),
            "downloadFullReport": reverse(
                "project:report_download", kwargs={"requested_document": "rapport-complet", **kwargs}
            ),
            "dowloadLocalReport": reverse(
                "project:report_download", kwargs={"requested_document": "rapport-local", **kwargs}
            ),
        }

    def get_navbar(self, obj):
        kwargs = {"pk": obj.id}
        return {
            "menuItems": [
                {
                    "label": "Synthèse",
                    "url": reverse("project:report_synthesis", kwargs=kwargs),
                    "icon": "bi bi-grid-1x2",
                },
                {
                    "label": "Les attendus de la loi C&R",
                    "icon": "bi bi-check-square",
                    "subMenu": [
                        {"label": "Rapport triennal local", "url": reverse("project:report_local", kwargs=kwargs)},
                        {
                            "label": "Trajectoire de sobriété foncière",
                            "url": reverse("project:report_target_2031", kwargs=kwargs),
                        },
                    ],
                },
                {
                    "label": "Pilotage territorial",
                    "icon": "bi bi-bar-chart",
                    "subMenu": [
                        {"label": "Consommation d'espaces NAF", "url": reverse("project:report_conso", kwargs=kwargs)},
                        {
                            "label": "Vacance des logements",
                            "url": reverse("project:report_logement_vacant", kwargs=kwargs),
                        },
                    ],
                },
                {"label": "Enjeux environnementaux", "icon": "bi bi-tree", "subMenu": []},
                {
                    "label": "Paramètres du diagnostic",
                    "icon": "bi bi-gear-fill",
                    "url": reverse("project:update", kwargs=kwargs),
                },
            ]
        }

    def get_footer(self, obj):
        return {
            "menuItems": [
                {"label": "Accessibilité: Non conforme", "url": reverse("home:accessibilite")},
                {"label": "Mentions légales", "url": reverse("home:cgv")},
                {"label": "Données personnelles", "url": reverse("home:privacy")},
                {"label": "Statistiques", "url": reverse("metabase:stats")},
                {"label": "FAQ", "url": Parameter.objects.get(slug="FAQ_URL").value, "target": "_blank"},
                {"label": "Contactez-nous", "url": reverse("home:contact")},
            ]
        }

    def get_header(self, obj):
        is_authenticated = self.context.get("request").user.is_authenticated

        return {
            "logos": [
                {
                    "src": static("img/republique-francaise-logo.svg"),
                    "alt": "Logo République Française",
                    "height": "70px",
                },
                {
                    "src": static("img/logo-mon-diagnostic-artificialisation.svg"),
                    "alt": "Logo Mon Diagnostic Artificialisation",
                    "url": "/",
                    "height": "50px",
                },
            ],
            "search": {
                "createUrl": reverse("project:create"),
            },
            "menuItems": [
                {
                    "label": "FAQ",
                    "url": Parameter.objects.get(slug="FAQ_URL").value,
                    "target": "_blank",
                    "shouldDisplay": True,
                },
                {"label": "Mes diagnostics", "url": reverse("project:list"), "shouldDisplay": is_authenticated},
                {"label": "Mon compte", "url": reverse("users:profile"), "shouldDisplay": is_authenticated},
                {"label": "Se connecter", "url": reverse("users:signin"), "shouldDisplay": not is_authenticated},
                {"label": "S'inscrire", "url": reverse("users:signup"), "shouldDisplay": not is_authenticated},
            ],
        }

    def get_departements(self, obj):
        return obj.land.get_departements()

    def get_bounds(self, obj):
        return obj.combined_emprise.extent

    def get_max_bounds(self, obj):
        return obj.combined_emprise.buffer(0.2).extent

    def get_centroid(self, obj):
        centroid = obj.combined_emprise.centroid
        return {
            "latitude": centroid.y,
            "longitude": centroid.x,
        }

    def get_emprise(self, obj):
        return obj.combined_emprise.simplify(0.001)

    class Meta:
        model = Project
        geo_field = "combined_emprise"
        fields = [
            "id",
            "created_date",
            "level_label",
            "analyse_start_date",
            "analyse_end_date",
            "territory_name",
            "has_zonage_urbanisme",
            "consommation_correction_status",
            "autorisation_logement_available",
            "logements_vacants_available",
            "land_id",
            "land_type",
            "departements",
            "bounds",
            "max_bounds",
            "centroid",
            "emprise",
            "urls",
            "navbar",
            "footer",
            "header",
        ]


class EmpriseSerializer(gis_serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "project",
        )
        geo_field = "mpoly"
        model = Emprise


class ProjectCommuneSerializer(gis_serializers.GeoFeatureModelSerializer):
    artif_area = serializers.FloatField()
    conso_1121_art = serializers.FloatField()
    conso_1121_hab = serializers.FloatField()
    conso_1121_act = serializers.FloatField()
    surface_artif = serializers.FloatField()

    class Meta:
        fields = (
            "id",
            "name",
            "insee",
            "area",
            "map_color",
            "artif_area",
            "conso_1121_art",
            "conso_1121_hab",
            "conso_1121_act",
        )
        geo_field = "mpoly"
        model = Commune
