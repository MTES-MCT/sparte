from django.db import models

from public_data.models.administration import AdminRef


class LandPopComparison(models.Model):
    relevance_level = models.CharField(choices=AdminRef.CHOICES)
    land_type = models.CharField(choices=AdminRef.CHOICES)
    land_id = models.CharField()
    from_year = models.IntegerField()
    to_year = models.IntegerField()
    evolution_median = models.FloatField()
    evolution_median_percent = models.FloatField()
    evolution_avg = models.FloatField()
    evolution_percent = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_landpopcomparison"
