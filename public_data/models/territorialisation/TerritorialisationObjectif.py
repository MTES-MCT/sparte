from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

from public_data.models.administration import LandModel


class TerritorialisationObjectif(models.Model):
    land = models.ForeignKey(
        LandModel,
        on_delete=models.DO_NOTHING,
        to_field="key",
        verbose_name="Territoire",
        related_name="territorialisation_objectifs",
        help_text="Territoire qui reçoit l'objectif",
    )
    parent = models.ForeignKey(
        LandModel,
        on_delete=models.DO_NOTHING,
        to_field="key",
        verbose_name="Parent",
        related_name="territorialisation_objectifs_as_parent",
        help_text="Territoire qui donne l'objectif",
        null=True,
        blank=True,
    )
    objectif_de_reduction = models.DecimalField(
        "Objectif de réduction",
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Objectif en pourcentage (0-100)",
    )
    nom_document = models.CharField(
        "Nom du document",
        max_length=255,
        default="SRADDET",
        help_text="Nom du document dans lequel doit s'inscrire l'objectif",
    )
    is_in_document = models.BooleanField(
        "Inscrit dans le document",
        default=False,
        help_text="Indique si l'objectif est inscrit dans le document d'urbanisme",
    )
    document_url = models.URLField(
        "URL du document",
        max_length=500,
        blank=True,
        null=True,
        help_text="Lien vers le document source",
    )
    document_comment = models.TextField(
        "Commentaire",
        blank=True,
        default="",
        help_text="Commentaire ou précision sur l'objectif",
    )

    def __str__(self):
        return f"{self.land.name} - {self.objectif_de_reduction}%"
