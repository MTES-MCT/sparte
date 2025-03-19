from django.contrib.gis.db import models
from django.contrib.postgres.fields import ArrayField

from public_data.models.enums import SRID


class Territoire(models.Model):
    id = models.CharField(primary_key=True)
    land_id = models.CharField()
    land_type = models.CharField()

    nom = models.CharField("Nom", max_length=70)
    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )
    departements = ArrayField(base_field=models.CharField())
    regions = ArrayField(base_field=models.CharField())

    childs = models.ManyToManyField("Territoire")
    parents = models.ManyToManyField("Territoire")
