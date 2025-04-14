from django.contrib.postgres.fields import ArrayField
from django.db import models

from public_data.models.administration import AdminRef


class BaseLandArtifStockCompositionIndex(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    departements = ArrayField(base_field=models.CharField())
    years = ArrayField(base_field=models.IntegerField())
    percent_of_land = models.FloatField()
    surface = models.FloatField()
    percent_of_artif = models.FloatField()
    millesime_index = models.IntegerField()

    class Meta:
        abstract = True
