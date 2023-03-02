import logging
from datetime import datetime

from django.db import models

# from django.dispatch import receiver

from project.models import Project
from public_data.models import Epci, Scot, Departement, Region

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
    date_first_download = models.DateTimeField(
        "Date du premier téléchargement", null=True, blank=True
    )

    class Meta:
        verbose_name = "Statistique"
        ordering = ["-created_date"]

    @staticmethod
    def receiver_project_post_save(instance, created, **kwargs):
        """Create or update StatDiagnostic when a Project is created or updated.
        Ensure that exception are catched to avoid breaking user doings."""
        try:
            StatDiagnostic.process_post_save(instance, created, **kwargs)
        except Exception as exc:
            logger.error("Error in StatDiagnostic.receiver_project_post_save: %s", exc)
            logger.exception(exc)

    @staticmethod
    def process_post_save(instance, created, **kwargs):
        """First create or update StatDiagnostic, then update locations if signal come from
        add_city_and_set_combined_emprise async task."""
        od = StatDiagnostic.create_or_update(instance, created)
        # only when async add_city_and_set_combined_emprise end successfully
        if kwargs.get("update_fields") == ["async_city_and_combined_emprise_done"]:
            StatDiagnostic.update_locations(instance, od)

    @staticmethod
    def create_or_update(instance, created) -> "StatDiagnostic":
        if created:
            od = StatDiagnostic(
                project=instance,
                created_date=instance.created_date,
                link=instance.get_absolute_url(),
                administrative_level=instance.land_type or "",
            )
        else:
            od = StatDiagnostic.objects.get(project=instance)
        od.is_anonymouse = (True if instance.user else False,)
        od.is_public = (instance.is_public,)
        od.start_date = (
            datetime(year=instance.analyse_start_date, month=1, day=1).date(),
        )
        od.end_date = (
            datetime(year=instance.analyse_end_date, month=12, day=31).date(),
        )
        od.analysis_level = instance.level or ""
        od.save()
        return od

    @staticmethod
    def update_locations(instance, od):
        city_list = instance.cities.all()
        qte = city_list.count()
        if qte > 0:
            if qte == 1:
                city = instance.cities.first()
                od.city = f"{city.name} ({city.insee})"
            epci_list = Epci.objects.filter(commune__in=city_list).distinct()
            if epci_list.count() == 1:
                od.epci = epci_list.first().name
            scot_list = Scot.objects.filter(commune__in=city_list).distinct()
            if scot_list.count() == 1:
                od.scot = scot_list.first().name
            dept_list = Departement.objects.filter(commune__in=city_list).distinct()
            if dept_list.count() == 1:
                od.departement = dept_list.first().name
            reg_list = Region.objects.filter(
                departement__commune__in=city_list
            ).distinct()
            if reg_list.count() == 1:
                od.region = reg_list.first().name
            od.save()

    @staticmethod
    def receiver_request_post_save(instance, created, **kwargs):
        """Update StatDiagnostic when a Project is downloaded.
        Ensure that exception are catched to avoid breaking user doings."""
        try:
            if created:
                od = StatDiagnostic.objects.get(project=instance)
                if not od.is_downaloaded:
                    od.is_downaloaded = True
                    od.date_first_download = instance.created_date
                    od.save()
        except Exception as exc:
            logger.error("Error in StatDiagnostic.receiver_request_post_save: %s", exc)
            logger.exception(exc)
