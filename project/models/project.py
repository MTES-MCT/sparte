from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils.functional import cached_property

from django.contrib.gis.db import models as gis_models
from django.contrib.gis.db.models import Union

from public_data.behaviors import DataColorationMixin

from .utils import user_directory_path


class BaseProject(models.Model):
    class Status(models.TextChoices):
        MISSING = "MISSING", "Emprise à renseigner"
        PENDING = "PENDING", "Traitement du fichier Shape en cours"
        SUCCESS = "SUCCESS", "Emprise renseignée"
        FAILED = "FAILED", "Création de l'emprise échouée"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        verbose_name="propriétaire",
    )
    name = models.CharField("Nom", max_length=100)
    description = models.TextField("Description", blank=True)
    shape_file = models.FileField(
        "Fichier .shp",
        upload_to=user_directory_path,
        max_length=100,
        blank=True,
        null=True,
    )
    # fields to track the shape files importation into the database
    import_error = models.TextField(
        "Message d'erreur traitement emprise",
        null=True,
        blank=True,
    )
    import_date = models.DateTimeField("Date et heure d'import", null=True, blank=True)
    import_status = models.CharField(
        "Statut import",
        max_length=10,
        choices=Status.choices,
        default=Status.MISSING,
    )

    @cached_property
    def combined_emprise(self):
        """Return a combined MultiPolygon of all emprises."""
        combined = self.emprise_set.aggregate(Union("mpoly"))
        if "mpoly__union" in combined:
            return combined["mpoly__union"]
        else:
            return None

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]
        abstract = True


class Project(BaseProject):

    ANALYZE_YEARS = (
        ("2015", "2015"),
        ("2018", "2018"),
    )

    analyse_start_date = models.CharField(
        "Date de début",
        choices=ANALYZE_YEARS,
        default="2015",
        max_length=4,
    )
    analyse_end_date = models.CharField(
        "Date de fin",
        choices=ANALYZE_YEARS,
        default="2018",
        max_length=4,
    )
    cities = models.ManyToManyField(
        "public_data.ArtifCommune",
        verbose_name="Communes",
        blank=True,
    )

    def get_absolute_url(self):
        return reverse("project:detail", kwargs={"pk": self.pk})


class Emprise(DataColorationMixin, gis_models.Model):

    # DataColorationMixin properties that need to be set when heritating
    default_property = "id"
    default_color = "blue"

    project = gis_models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        verbose_name="Projet",
    )
    mpoly = gis_models.MultiPolygonField()

    class Meta:
        ordering = ["project"]
