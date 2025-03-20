from django.db import models

from public_data.models.administration import AdminRef


class LandConsoComparison(models.Model):
    relevance_level = models.CharField(choices=AdminRef.CHOICES)
    land_type = models.CharField(choices=AdminRef.CHOICES)
    land_id = models.CharField()
    from_year = models.IntegerField()
    to_year = models.IntegerField()
    median_ratio_pop_conso = models.FloatField(help_text="Médiane du ratio flux de conso et flux de pop (conso / pop)")

    class Meta:
        managed = False
        db_table = "public_data_landconsocomparison"
