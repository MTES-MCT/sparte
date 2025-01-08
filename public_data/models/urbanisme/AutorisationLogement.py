from django.db import models

from public_data.models.administration import AdminRef


class AutorisationLogement(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)
    year = models.IntegerField()
    logements_autorises = models.IntegerField()
    logements_commences = models.IntegerField()
    surface_de_plancher_autorisee = models.DecimalField()
    surface_de_plancher_commencee = models.DecimalField()
    percent_autorises_on_parc_general = models.DecimalField()
    percent_autorises_on_vacants_parc_general = models.DecimalField()

    class Meta:
        managed = False
        db_table = "public_data_autorisationlogement"
