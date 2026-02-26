from django.db import models

from public_data.models.administration import AdminRef


class LandDcSalaires(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    salaire_net_moyen = models.FloatField(null=True)
    salaire_net_moyen_femmes = models.FloatField(null=True)
    salaire_net_moyen_hommes = models.FloatField(null=True)
    salaire_net_moyen_moins_25 = models.FloatField(null=True)
    salaire_net_moyen_25_39 = models.FloatField(null=True)
    salaire_net_moyen_40_49 = models.FloatField(null=True)
    salaire_net_moyen_50_54 = models.FloatField(null=True)
    salaire_net_moyen_55_plus = models.FloatField(null=True)
    salaire_net_moyen_cadres = models.FloatField(null=True)
    salaire_net_moyen_prof_intermediaires = models.FloatField(null=True)
    salaire_net_moyen_employes = models.FloatField(null=True)
    salaire_net_moyen_ouvriers = models.FloatField(null=True)
    salaire_net_moyen_femmes_moins_25 = models.FloatField(null=True)
    salaire_net_moyen_femmes_25_39 = models.FloatField(null=True)
    salaire_net_moyen_femmes_40_49 = models.FloatField(null=True)
    salaire_net_moyen_femmes_50_54 = models.FloatField(null=True)
    salaire_net_moyen_femmes_55_plus = models.FloatField(null=True)
    salaire_net_moyen_hommes_moins_25 = models.FloatField(null=True)
    salaire_net_moyen_hommes_25_39 = models.FloatField(null=True)
    salaire_net_moyen_hommes_40_49 = models.FloatField(null=True)
    salaire_net_moyen_hommes_50_54 = models.FloatField(null=True)
    salaire_net_moyen_hommes_55_plus = models.FloatField(null=True)
    salaire_net_moyen_femmes_cadres = models.FloatField(null=True)
    salaire_net_moyen_femmes_prof_intermediaires = models.FloatField(null=True)
    salaire_net_moyen_femmes_employes = models.FloatField(null=True)
    salaire_net_moyen_femmes_ouvriers = models.FloatField(null=True)
    salaire_net_moyen_hommes_cadres = models.FloatField(null=True)
    salaire_net_moyen_hommes_prof_intermediaires = models.FloatField(null=True)
    salaire_net_moyen_hommes_employes = models.FloatField(null=True)
    salaire_net_moyen_hommes_ouvriers = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_salaires"
