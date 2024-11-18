from django.db import models

from public_data.models.administration import AdminRef


class LandPop(models.Model):
    class Source(models.TextChoices):
        INSEE = "INSEE"
        PROJECTION = "PROJECTION"

    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    year = models.IntegerField()
    evolution = models.IntegerField()
    population = models.IntegerField()
    source = models.CharField(choices=Source.choices)

    class Meta:
        managed = False
        db_table = "public_data_landpop"
