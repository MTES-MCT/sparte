import logging
from datetime import datetime

from django.db import models

from project.models import Project, Request
from trajectory.models import Trajectory
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

    has_trajectory = models.BooleanField("A une trajectoire", default=False)
    date_first_trajectory = models.DateTimeField("Date de la première trajectoire", null=True, blank=True)

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

    def update_with_trajectory(self, trajectory: Trajectory) -> None:
        if not self.has_trajectory:
            self.has_trajectory = True
            self.date_first_trajectory = trajectory.created_at
            self.save()

    def update_locations(self, project: Project) -> None:
        qs = project.cities.all().select_related("epci", "departement", "scot", "departement__region")

        if qs.count() == 1:
            city = qs.first()
            self.city = f"{city.name} ({city.insee})"

        if qs.values("epci__name").distinct().count() == 1:
            self.epci = qs.values("epci__name").distinct().first()['epci__name']

        if qs.values("scot__name").distinct().count() == 1:
            self.scot = qs.values("scot__name").distinct().first()['scot__name']

        if qs.values("departement__name").distinct().count() == 1:
            self.departement = qs.values("departement__name").distinct().first()['departement__name']

        if qs.values("departement__region__name").distinct().count() == 1:
            self.region = qs.values("departement__region__name").distinct().first()["departement__region__name"]

    @classmethod
    def get_or_create(cls, project: Project) -> "StatDiagnostic":
        try:
            return project.statdiagnostic
        except StatDiagnostic.DoesNotExist:
            return StatDiagnostic(
                project=project,
                created_date=project.created_date,
                link=get_url_with_domain(project.get_absolute_url()),
                administrative_level=project.land_type or "",
            )

    @classmethod
    def project_post_save(cls, project_id: int, do_location: bool) -> None:
        """Create or update StatDiagnostic when a Project is created or updated.
        Ensure that exception are catched to avoid breaking user doings."""
        try:
            project = Project.objects.get(id=project_id)
            od = cls.get_or_create(project)
            od.update_with_project(project)
            od.save()
            if do_location:
                od.update_locations(project)
                od.save()
        except Project.DoesNotExist:
            logger.error("%d project does not exists, stats are not updated.", project_id)

    @classmethod
    def request_post_save(cls, request_id: int) -> None:
        """Update StatDiagnostic when a Project is downloaded.
        Ensure that exception are catched to avoid breaking user doings."""
        try:
            req = Request.objects.get(id=request_id)
            od = cls.get_or_create(req.project)
            od.update_with_request(req)
        except Request.DoesNotExist:
            logger.error("%d request does not exists, stats are not updated.", request_id)

    @classmethod
    def trajectory_post_save(cls, trajectory_id: int) -> None:
        """Update StatDiagnostic when a Project has a trajectory.
        Ensure that exception are catched to avoid breaking user doings."""
        try:
            trajectory = Trajectory.objects.get(id=trajectory_id)
            od = cls.get_or_create(trajectory.project)
            od.update_with_trajectory(trajectory)
        except Request.DoesNotExist:
            logger.error("%d trajectory does not exists, stats are not updated.", trajectory_id)
