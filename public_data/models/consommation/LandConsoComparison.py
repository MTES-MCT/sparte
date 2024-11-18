from django.db import models

from public_data.models.administration import AdminRef


class LandConsoComparison(models.Model):
    relevance_level = models.CharField(choices=AdminRef.CHOICES)
    land_type = models.CharField(choices=AdminRef.CHOICES)
    land_id = models.CharField()
    from_year = models.IntegerField()
    to_year = models.IntegerField()
    total_median = models.FloatField()
    total_median_percent = models.FloatField()
    total_avg = models.FloatField()
    total_percent = models.FloatField()
    activite_median = models.FloatField()
    activite_median_percent = models.FloatField()
    activite_avg = models.FloatField()
    activite_percent = models.FloatField()
    habitat_median = models.FloatField()
    habitat_median_percent = models.FloatField()
    habitat_avg = models.FloatField()
    habitat_percent = models.FloatField()
    mixte_median = models.FloatField()
    mixte_median_percent = models.FloatField()
    mixte_avg = models.FloatField()
    mixte_percent = models.FloatField()
    route_median = models.FloatField()
    route_median_percent = models.FloatField()
    route_avg = models.FloatField()
    route_percent = models.FloatField()
    ferroviaire_median = models.FloatField()
    ferroviaire_median_percent = models.FloatField()
    ferroviaire_avg = models.FloatField()
    ferroviaire_percent = models.FloatField()
    inconnu_median = models.FloatField()
    inconnu_median_percent = models.FloatField()
    inconnu_avg = models.FloatField()
    inconnu_percent = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_landconsocomparison"
