from django.db import models

from public_data.models.administration import AdminRef


class LandPopStats(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    comparison_level = models.CharField()
    comparison_id = models.CharField(choices=AdminRef.CHOICES)
    from_year = models.IntegerField()
    to_year = models.IntegerField()
    evolution = models.FloatField()
    evolution_percent = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_landpopstats"
