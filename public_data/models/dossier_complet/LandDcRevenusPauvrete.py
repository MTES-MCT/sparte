from django.db import models

from public_data.models.administration import AdminRef


class LandDcRevenusPauvrete(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    nb_menages_fiscaux = models.FloatField(null=True)
    nb_personnes_menages_fiscaux = models.FloatField(null=True)
    mediane_niveau_vie = models.FloatField(null=True)
    part_menages_imposes = models.FloatField(null=True)
    taux_pauvrete = models.FloatField(null=True)
    taux_pauvrete_moins_30 = models.FloatField(null=True)
    taux_pauvrete_30_39 = models.FloatField(null=True)
    taux_pauvrete_40_49 = models.FloatField(null=True)
    taux_pauvrete_50_59 = models.FloatField(null=True)
    taux_pauvrete_60_74 = models.FloatField(null=True)
    taux_pauvrete_75_plus = models.FloatField(null=True)
    taux_pauvrete_proprietaires = models.FloatField(null=True)
    taux_pauvrete_locataires = models.FloatField(null=True)
    part_revenus_activite = models.FloatField(null=True)
    part_salaires = models.FloatField(null=True)
    part_indemnites_chomage = models.FloatField(null=True)
    part_revenus_non_salaries = models.FloatField(null=True)
    part_pensions_retraites = models.FloatField(null=True)
    part_revenus_patrimoine = models.FloatField(null=True)
    part_prestations_sociales = models.FloatField(null=True)
    part_prestations_familiales = models.FloatField(null=True)
    part_minima_sociaux = models.FloatField(null=True)
    part_prestations_logement = models.FloatField(null=True)
    part_impots = models.FloatField(null=True)
    decile_1 = models.FloatField(null=True)
    decile_9 = models.FloatField(null=True)
    rapport_interdecile = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_revenus_pauvrete"
