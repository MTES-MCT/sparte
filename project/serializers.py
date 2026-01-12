from django.templatetags.static import static
from django.urls import reverse
from django_app_parameter.models import Parameter
from rest_framework import serializers
from rest_framework.serializers import SerializerMethodField
from rest_framework_gis import serializers as gis_serializers

from project.models import Project, ReportDraft, Request, RequestedDocumentChoices

from .models import Emprise


class ProjectDetailSerializer(gis_serializers.GeoModelSerializer):
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
            "artificialisation": reverse("project:report_artif", kwargs=kwargs),
            "impermeabilisation": reverse("project:report_imper", kwargs=kwargs),
            "rapportLocal": reverse("project:report_local", kwargs=kwargs),
            "trajectoires": reverse("project:report_target_2031", kwargs=kwargs),
            "consommation": reverse("project:report_conso", kwargs=kwargs),
            "logementVacant": reverse("project:report_logement_vacant", kwargs=kwargs),
            "friches": reverse("project:report_friches", kwargs=kwargs),
            "downloads": reverse("project:report_downloads", kwargs=kwargs),
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
                            "label": "Artificialisation",
                            "url": reverse("project:report_artif", kwargs=kwargs),
                        },
                        {
                            "label": "Imperméabilisation",
                            "url": reverse("project:report_imper", kwargs=kwargs),
                            "new": True,
                        },
                    ],
                },
                {
                    "label": "Leviers de sobriété foncière",
                    "icon": "bi bi-bar-chart",
                    "subMenu": [
                        {
                            "label": "Vacance des logements",
                            "url": reverse("project:report_logement_vacant", kwargs=kwargs),
                        },
                        {
                            "label": "Friches",
                            "url": reverse("project:report_friches", kwargs=kwargs),
                        },
                    ],
                },
            ]
        }

    def get_footer(self, obj):
        return {
            "menuItems": [
                {"label": "Accessibilité: Non conforme", "url": reverse("home:accessibilite")},
                {"label": "Mentions légales", "url": reverse("home:cgv")},
                {"label": "Données personnelles", "url": reverse("home:privacy")},
                {"label": "Centre d'aide", "url": Parameter.objects.get(slug="FAQ_URL").value, "target": "_blank"},
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
                    "label": "Centre d'aide",
                    "url": Parameter.objects.get(slug="FAQ_URL").value,
                    "target": "_blank",
                    "shouldDisplay": True,
                },
                {"label": "Mes diagnostics", "url": reverse("project:list"), "shouldDisplay": is_authenticated},
                {"label": "Mon compte", "url": reverse("users:profile"), "shouldDisplay": is_authenticated},
                {"label": "Se déconnecter", "url": reverse("users:signout"), "shouldDisplay": is_authenticated},
                {"label": "Se connecter", "url": reverse("users:signin"), "shouldDisplay": not is_authenticated},
                {"label": "S'inscrire", "url": reverse("users:signup"), "shouldDisplay": not is_authenticated},
            ],
        }

    def get_departements(self, obj):
        return obj.land_model.departements

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
            "target_2031",
            "comparison_lands",
            "departements",
            "bounds",
            "max_bounds",
            "centroid",
            "urls",
            "navbar",
            "footer",
            "header",
        ]


class ProjectDownloadLinkSerializer(serializers.ModelSerializer):
    rapport_local_url = SerializerMethodField()
    rapport_complet_url = SerializerMethodField()

    def _is_report_outdated(self, request_obj, project):
        if not request_obj or not request_obj.sent_file:
            return True

        return project.updated_date > request_obj.created_date

    def get_rapport_local_url(self, obj):
        project: Project = obj
        requests = Request.objects.filter(
            project=project,
            requested_document=RequestedDocumentChoices.RAPPORT_LOCAL,
        ).order_by("-created_date")

        if requests.exists():
            latest_request = requests.first()
            if not self._is_report_outdated(latest_request, project):
                return latest_request.sent_file.url if latest_request.sent_file else None

        return None

    def get_rapport_complet_url(self, obj):
        project: Project = obj
        requests = Request.objects.filter(
            project=project,
            requested_document=RequestedDocumentChoices.RAPPORT_COMPLET,
        ).order_by("-created_date")

        if requests.exists():
            latest_request = requests.first()
            if not self._is_report_outdated(latest_request, project):
                return latest_request.sent_file.url if latest_request.sent_file else None

        return None

    class Meta:
        model = Project
        fields = [
            "id",
            "rapport_local_url",
            "rapport_complet_url",
        ]


class EmpriseSerializer(gis_serializers.GeoFeatureModelSerializer):
    class Meta:
        fields = (
            "id",
            "project",
        )
        geo_field = "mpoly"
        model = Emprise


class ReportDraftSerializer(serializers.ModelSerializer):
    report_type_display = serializers.CharField(source="get_report_type_display", read_only=True)

    class Meta:
        model = ReportDraft
        fields = [
            "id",
            "project",
            "report_type",
            "report_type_display",
            "name",
            "content",
            "land_type",
            "land_id",
            "comparison_lands",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "report_type_display"]


class ReportDraftListSerializer(serializers.ModelSerializer):
    report_type_display = serializers.CharField(source="get_report_type_display", read_only=True)

    class Meta:
        model = ReportDraft
        fields = [
            "id",
            "project",
            "report_type",
            "report_type_display",
            "name",
            "created_at",
            "updated_at",
        ]
