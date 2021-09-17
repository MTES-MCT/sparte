from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone

from django.contrib.gis.db import models as gis_models


from public_data.behaviors import DataColorationMixin


def user_directory_path(instance, filename):
    year = timezone.now().year
    month = timezone.now().month
    id = instance.user.id
    return f"user_{id}/{year}{month:02}/{filename}"


class Project(models.Model):

    ANALYZE_YEARS = (
        ("2015", "2015"),
        ("2018", "2018"),
    )

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

    def get_absolute_url(self):
        return reverse("project:detail", kwargs={"pk": self.pk})

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class Emprise(gis_models.Model, DataColorationMixin):

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
