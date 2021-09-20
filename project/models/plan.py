from django.db import models
from django.contrib.gis.db import models as gis_models

from public_data.behaviors import DataColorationMixin

from .project import BaseProject, Project


class Plan(BaseProject):
    supplier_email = models.EmailField("Email du prestataire", blank=True)
    project = gis_models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        verbose_name="Projet",
    )


class PlanEmprise(DataColorationMixin, gis_models.Model):

    # DataColorationMixin properties that need to be set when heritating
    default_property = "surface"
    default_color = "violet"

    plan = gis_models.ForeignKey(Plan, on_delete=models.CASCADE)
    mpoly = gis_models.MultiPolygonField()

    name = gis_models.CharField("Nom", max_length=100)
    description = gis_models.TextField("Description", blank=True)
    lot = gis_models.CharField("Lot", max_length=100, blank=True)
    surface = gis_models.IntegerField("Surface (ha)", blank=True, null=True)
    us_code = gis_models.CharField("Code usage du sol", max_length=10, blank=True)
    cs_code = gis_models.CharField("Code couverture du sol", max_length=10, blank=True)
    prev_surface_artificial = gis_models.IntegerField(
        "Surface artificielle avant (ha)", blank=True, null=True
    )
    prev_surface_natural = gis_models.IntegerField(
        "Surface naturelle avant (ha)", blank=True, null=True
    )
    new_surface_artificial = gis_models.IntegerField(
        "Nouvelle surface artificielle (ha)", blank=True, null=True
    )
    new_surface_natural = gis_models.IntegerField(
        "Nouvelle surface naturelle (ha)", blank=True, null=True
    )

    class Meta:
        ordering = ["plan", "name"]
