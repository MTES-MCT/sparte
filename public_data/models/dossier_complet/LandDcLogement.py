from django.db import models

from public_data.models.administration import AdminRef


class LandDcLogement(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    # common_cols x years 22, 16, 11
    logements_22 = models.FloatField(null=True)
    residences_principales_22 = models.FloatField(null=True)
    residences_secondaires_22 = models.FloatField(null=True)
    logements_vacants_22 = models.FloatField(null=True)
    maisons_22 = models.FloatField(null=True)
    appartements_22 = models.FloatField(null=True)
    rp_proprietaires_22 = models.FloatField(null=True)
    rp_locataires_22 = models.FloatField(null=True)
    rp_locataires_hlm_22 = models.FloatField(null=True)
    rp_loges_gratuit_22 = models.FloatField(null=True)
    rp_maisons_22 = models.FloatField(null=True)
    rp_appartements_22 = models.FloatField(null=True)
    nb_pieces_rp_22 = models.FloatField(null=True)
    rp_1_voiture_plus_22 = models.FloatField(null=True)
    rp_1_voiture_22 = models.FloatField(null=True)
    rp_2_voitures_plus_22 = models.FloatField(null=True)
    rp_garage_22 = models.FloatField(null=True)
    rp_electricite_22 = models.FloatField(null=True)
    rp_eau_chaude_22 = models.FloatField(null=True)

    logements_16 = models.FloatField(null=True)
    residences_principales_16 = models.FloatField(null=True)
    residences_secondaires_16 = models.FloatField(null=True)
    logements_vacants_16 = models.FloatField(null=True)
    maisons_16 = models.FloatField(null=True)
    appartements_16 = models.FloatField(null=True)
    rp_proprietaires_16 = models.FloatField(null=True)
    rp_locataires_16 = models.FloatField(null=True)
    rp_locataires_hlm_16 = models.FloatField(null=True)
    rp_loges_gratuit_16 = models.FloatField(null=True)
    rp_maisons_16 = models.FloatField(null=True)
    rp_appartements_16 = models.FloatField(null=True)
    nb_pieces_rp_16 = models.FloatField(null=True)
    rp_1_voiture_plus_16 = models.FloatField(null=True)
    rp_1_voiture_16 = models.FloatField(null=True)
    rp_2_voitures_plus_16 = models.FloatField(null=True)
    rp_garage_16 = models.FloatField(null=True)
    rp_electricite_16 = models.FloatField(null=True)
    rp_eau_chaude_16 = models.FloatField(null=True)

    logements_11 = models.FloatField(null=True)
    residences_principales_11 = models.FloatField(null=True)
    residences_secondaires_11 = models.FloatField(null=True)
    logements_vacants_11 = models.FloatField(null=True)
    maisons_11 = models.FloatField(null=True)
    appartements_11 = models.FloatField(null=True)
    rp_proprietaires_11 = models.FloatField(null=True)
    rp_locataires_11 = models.FloatField(null=True)
    rp_locataires_hlm_11 = models.FloatField(null=True)
    rp_loges_gratuit_11 = models.FloatField(null=True)
    rp_maisons_11 = models.FloatField(null=True)
    rp_appartements_11 = models.FloatField(null=True)
    nb_pieces_rp_11 = models.FloatField(null=True)
    rp_1_voiture_plus_11 = models.FloatField(null=True)
    rp_1_voiture_11 = models.FloatField(null=True)
    rp_2_voitures_plus_11 = models.FloatField(null=True)
    rp_garage_11 = models.FloatField(null=True)
    rp_electricite_11 = models.FloatField(null=True)
    rp_eau_chaude_11 = models.FloatField(null=True)

    # Anciennete construction year 22
    rp_ach_total_22 = models.FloatField(null=True)
    rp_avant_1919_22 = models.FloatField(null=True)
    rp_1919_1945_22 = models.FloatField(null=True)
    rp_1946_1970_22 = models.FloatField(null=True)
    rp_1971_1990_22 = models.FloatField(null=True)
    rp_1991_2005_22 = models.FloatField(null=True)
    rp_2006_2019_22 = models.FloatField(null=True)

    # Anciennete construction year 16
    rp_ach_total_16 = models.FloatField(null=True)
    rp_avant_1919_16 = models.FloatField(null=True)
    rp_1919_1945_16 = models.FloatField(null=True)
    rp_1946_1970_16 = models.FloatField(null=True)
    rp_1971_1990_16 = models.FloatField(null=True)
    rp_1991_2005_16 = models.FloatField(null=True)
    rp_2006_2013_16 = models.FloatField(null=True)

    # Anciennete construction year 11
    rp_ach_total_11 = models.FloatField(null=True)
    rp_avant_1946_11 = models.FloatField(null=True)
    rp_1946_1990_11 = models.FloatField(null=True)
    rp_1991_2008_11 = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_logement"
