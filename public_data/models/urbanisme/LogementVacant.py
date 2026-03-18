from django.db import models

from public_data.models.administration import AdminRef


class LogementVacant(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    year = models.IntegerField()
    # Null quand les données sont indisponibles ou secrétisées pour certains territoires
    logements_parc_prive = models.IntegerField(null=True, blank=True)
    logements_vacants_parc_prive = models.IntegerField(null=True, blank=True)
    logements_parc_social = models.IntegerField(null=True, blank=True)
    logements_vacants_parc_social = models.IntegerField(null=True, blank=True)
    logements_vacants_parc_general = models.IntegerField(null=True, blank=True)
    logements_vacants_parc_general_percent = models.FloatField(null=True, blank=True)
    logements_vacants_parc_prive_percent = models.FloatField(null=True, blank=True)
    logements_vacants_parc_social_percent = models.FloatField(null=True, blank=True)
    logements_vacants_parc_prive_on_parc_general_percent = models.FloatField(null=True, blank=True)
    logements_vacants_parc_social_on_parc_general_percent = models.FloatField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "public_data_logementvacant"
