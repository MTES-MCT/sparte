import logging
from datetime import datetime

from django.db import models

# from django.dispatch import receiver

from project.models import Project, Request
from utils.functions import get_url_with_domain

logger = logging.getLogger(__name__)


GROUP_ORGANISM = {
    "AGENCE": "bureaux d'études",
    "AMENAG": "bureaux d'études",
    "ASSOCI": "Grand public",
    "BUREAU": "bureaux d'études",
    "COMMUN": "collectivités",
    "DDT": "Services de l'Etat",
    "DEPART": "collectivités",
    "DREAL": "Services de l'Etat",
    "EPCI": "collectivités",
    "EPF": "Services de l'Etat",
    "GIP": "bureaux d'études",
    "PARTIC": "Grand public",
    "REGION": "collectivités",
    "SCOT": "collectivités",
    "AUTRE": "AUTRE",
}


class StatDiagnostic(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, verbose_name="Diagnostic d'origine")
    created_date = models.DateTimeField("Date de création")
    is_anonymouse = models.BooleanField("Est anonyme", default=True)
    is_public = models.BooleanField("Est public", default=True)
    administrative_level = models.CharField("Niveau administratif", max_length=255, blank=True, null=True)
    analysis_level = models.CharField("Maille d'analyse", max_length=255)
    start_date = models.DateField("Date de début")
    end_date = models.DateField("Date de fin")
    link = models.CharField("Lien vers le diagnostic", max_length=255)

    city = models.CharField("Commune", max_length=255, blank=True, null=True)
    epci = models.CharField("EPCI", max_length=255, blank=True, null=True)
    scot = models.CharField("SCoT", max_length=255, blank=True, null=True)
    departement = models.CharField("Département", max_length=255, blank=True, null=True)
    region = models.CharField("Région", max_length=255, blank=True, null=True)

    is_downaloaded = models.BooleanField("A été téléchargé", default=False)
    request = models.ForeignKey(Request, on_delete=models.SET_NULL, null=True, blank=True)
    date_first_download = models.DateTimeField("Date du premier téléchargement", null=True, blank=True)
    organism = models.CharField("Organisme", max_length=255, blank=True, null=True)
    group_organism = models.CharField("Groupe d'organisme", max_length=50, blank=True, null=True)

    class Meta:
        verbose_name = "Statistique"
        ordering = ["-created_date"]

    def update_with_project(self, project: Project) -> None:
        self.is_anonymouse = False if project.user_id else True
        self.is_public = project.is_public
        self.start_date = datetime(year=int(project.analyse_start_date), month=1, day=1).date()
        self.end_date = datetime(year=int(project.analyse_end_date), month=12, day=31).date()
        self.analysis_level = project.level or ""

    def update_with_request(self, request: Request) -> None:
        if not self.is_downaloaded:
            self.is_downaloaded = True
            self.request = request
            self.organism = request.organism
            self.group_organism = GROUP_ORGANISM.get(request.organism, "AUTRE")
            self.date_first_download = request.created_date
            self.save()

    def update_locations(self, project: Project) -> None:
        qs = project.cities.all().select_related("epci", "departement", "scot", "departement__region")

        city_set = set()
        epci_set = set()
        scot_set = set()
        departement_set = set()
        region_set = set()
        for city in qs:
            city_set.add(city)
            epci_set.add(city.epci)
            scot_set.add(city.scot)
            departement_set.add(city.departement)
            region_set.add(city.departement.region)

        if len(city_set) == 1:
            city = next(iter(city_set))
            self.city = f"{city.name} ({city.insee})"

        if len(epci_set) == 1:
            self.epci = next(iter(epci_set)).name

        if len(scot_set) == 1:
            scot = next(iter(scot_set))
            if scot:
                self.scot = scot.name

        if len(departement_set) == 1:
            self.departement = next(iter(departement_set)).name

        if len(region_set) == 1:
            self.region = next(iter(region_set)).name

    @classmethod
    def get_or_create(cls, project: Project) -> "StatDiagnostic":
        try:
            return StatDiagnostic.objects.get(project=project)
        except StatDiagnostic.DoesNotExist:
            return StatDiagnostic(
                project=project,
                created_date=project.created_date,
                link=get_url_with_domain(project.get_absolute_url()),
                administrative_level=project.land_type or "",
            )

    @classmethod
    def receiver_project_post_save(cls, instance: Project, created: bool, **kwargs) -> None:
        """Create or update StatDiagnostic when a Project is created or updated.
        Ensure that exception are catched to avoid breaking user doings."""
        try:
            od = cls.get_or_create(instance)
            od.update_with_project(instance)
            if kwargs.get("update_fields") == {"async_city_and_combined_emprise_done"}:
                # only when async add_city_and_set_combined_emprise end successfully
                od.update_locations(instance)
            od.save()
        except Exception as exc:
            logger.error("Error in StatDiagnostic.receiver_project_post_save: %s", exc)
            logger.exception(exc)

    @classmethod
    def receiver_request_post_save(cls, instance, created, **kwargs):
        """Update StatDiagnostic when a Project is downloaded.
        Ensure that exception are catched to avoid breaking user doings."""
        try:
            if created:
                od = cls.get_or_create(instance.project)
                od.update_with_request(instance)
        except Exception as exc:
            logger.error("Error in StatDiagnostic.receiver_request_post_save: %s", exc)
            logger.exception(exc)
