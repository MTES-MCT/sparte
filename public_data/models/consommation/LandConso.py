from django.db import models

from public_data.models.administration import AdminRef


class LandConso(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    surface = models.FloatField()
    year = models.IntegerField()
    total = models.FloatField()
    activite = models.FloatField()
    habitat = models.FloatField()
    mixte = models.FloatField()
    route = models.FloatField()
    ferroviaire = models.FloatField()
    inconnu = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_landconso"

    def __str__(self):
        return f"{self.land_type} {self.land_id} ({self.year})"
