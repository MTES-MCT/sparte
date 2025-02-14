from django.contrib.postgres.fields import ArrayField
from django.db import models

from public_data.models.administration import AdminRef


class ArtifZonage(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    departements = ArrayField(models.CharField())
    year = models.IntegerField()
    surface = models.FloatField()
    artificial_surface = models.FloatField()
    zonage_type = models.CharField()
    zonage_count = models.IntegerField()
    artificial_percent = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_artifzonage"
