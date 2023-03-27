import logging
from datetime import datetime

from django.db import models

# from django.dispatch import receiver

from project.models import Project, Request
from public_data.models import Epci, Scot, Departement, Region
from utils.functions import get_url_with_domain

logger = logging.getLogger(__name__)


class StatDiagnostic(models.Model):
    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, verbose_name="Diagnostic d'origine"
    )
    created_date = models.DateTimeField("Date de création")
    is_anonymouse = models.BooleanField("Est anonyme", default=True)
    is_public = models.BooleanField("Est public", default=True)
    administrative_level = models.CharField(
        "Niveau administratif", max_length=255, blank=True, null=True
    )
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
    request = models.ForeignKey(
        Request, on_delete=models.SET_NULL, null=True, blank=True
    )
    date_first_download = models.DateTimeField(
        "Date du premier téléchargement", null=True, blank=True
    )
    organism = models.CharField("Organisme", max_length=255, blank=True, null=True)
    group_organism = models.CharField(
        "Groupe d'organisme", max_length=50, blank=True, null=True
    )

    class Meta:
        verbose_name = "Statistique"
        ordering = ["-created_date"]

    def update_with_project(self, project: Project) -> None:
        self.is_anonymouse = False if project.user else True
        self.is_public = project.is_public
        self.start_date = datetime(year=int(project.analyse_start_date), month=1, day=1).date()
        self.end_date = datetime(year=int(project.analyse_end_date), month=12, day=31).date()
        self.analysis_level = project.level or ""

    def update_with_request(self, request: Request) -> None:
        if not self.is_downaloaded:
            self.is_downaloaded = True
            self.date_first_download = request.created_date
            self.save()

    def update_locations(self, project: Project) -> None:
        city_list = project.cities.all()
        qte = city_list.count()
        if qte > 0:
            if qte == 1:
                city = project.cities.first()
                self.city = f"{city.name} ({city.insee})"
            epci_list = Epci.objects.filter(commune__in=city_list).distinct()
            if epci_list.count() == 1:
                self.epci = epci_list.first().name
            scot_list = Scot.objects.filter(commune__in=city_list).distinct()
            if scot_list.count() == 1:
                self.scot = scot_list.first().name
            dept_list = Departement.objects.filter(commune__in=city_list).distinct()
            if dept_list.count() == 1:
                self.departement = dept_list.first().name
            reg_list = Region.objects.filter(
                departement__commune__in=city_list
            ).distinct()
            if reg_list.count() == 1:
                self.region = reg_list.first().name

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
