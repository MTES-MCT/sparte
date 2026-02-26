from django.db import models

from public_data.models.administration import AdminRef


class LandDcElecteurs(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    electeurs_2020 = models.FloatField(null=True)
    electeurs_2021 = models.FloatField(null=True)
    electeurs_2022 = models.FloatField(null=True)
    electeurs_2024 = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_electeurs"
