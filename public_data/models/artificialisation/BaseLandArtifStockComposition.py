from django.db import models

from public_data.models.administration import AdminRef


class BaseLandArtifStockComposition(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    departement = models.CharField()
    year = models.IntegerField()
    percent_of_land = models.FloatField()
    surface = models.FloatField()
    percent_of_artif = models.FloatField()
    millesime_index = models.IntegerField()
    color = models.CharField()
    label = models.CharField()
    label_short = models.CharField()

    class Meta:
        abstract = True
