from django.db import models

from public_data.models.administration import AdminRef


class LogementVacant(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    year = models.IntegerField()
    logements_parc_prive = models.IntegerField()
    logements_vacants_parc_prive = models.IntegerField()
    logements_parc_social = models.IntegerField()
    logements_vacants_parc_social = models.IntegerField()
    logements_vacants_parc_general_percent = models.DecimalField()
    logements_vacants_parc_prive_percent = models.DecimalField()
    logements_vacants_parc_social_percent = models.DecimalField()

    class Meta:
        managed = False
        db_table = "public_data_logementvacant"
