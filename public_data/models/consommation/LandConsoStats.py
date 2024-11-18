from django.db import models

from public_data.models.administration import AdminRef


class LandConsoStats(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    comparison_level = models.CharField(choices=AdminRef.CHOICES)
    comparison_id = models.CharField(choices=AdminRef.CHOICES)
    from_year = models.IntegerField()
    to_year = models.IntegerField()
    total = models.FloatField()
    total_percent = models.FloatField()
    activite = models.FloatField()
    activite_percent = models.FloatField()
    habitat = models.FloatField()
    habitat_percent = models.FloatField()
    mixte = models.FloatField()
    mixte_percent = models.FloatField()
    route = models.FloatField()
    route_percent = models.FloatField()
    ferroviaire = models.FloatField()
    ferroviaire_percent = models.FloatField()
    inconnu = models.FloatField()
    inconnu_percent = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_landconsostats"
