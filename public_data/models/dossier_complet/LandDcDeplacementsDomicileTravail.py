from django.db import models

from public_data.models.administration import AdminRef


class LandDcDeplacementsDomicileTravail(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    # common_names x years 22, 16, 11
    travaille_commune_residence_22 = models.FloatField(null=True)
    travaille_autre_commune_22 = models.FloatField(null=True)
    travaille_autre_commune_meme_dept_22 = models.FloatField(null=True)
    travaille_autre_dept_meme_region_22 = models.FloatField(null=True)
    travaille_autre_region_22 = models.FloatField(null=True)
    travaille_hors_metropole_22 = models.FloatField(null=True)
    transport_aucun_22 = models.FloatField(null=True)
    transport_marche_22 = models.FloatField(null=True)
    transport_voiture_22 = models.FloatField(null=True)
    transport_commun_22 = models.FloatField(null=True)

    travaille_commune_residence_16 = models.FloatField(null=True)
    travaille_autre_commune_16 = models.FloatField(null=True)
    travaille_autre_commune_meme_dept_16 = models.FloatField(null=True)
    travaille_autre_dept_meme_region_16 = models.FloatField(null=True)
    travaille_autre_region_16 = models.FloatField(null=True)
    travaille_hors_metropole_16 = models.FloatField(null=True)
    transport_aucun_16 = models.FloatField(null=True)
    transport_marche_16 = models.FloatField(null=True)
    transport_voiture_16 = models.FloatField(null=True)
    transport_commun_16 = models.FloatField(null=True)

    travaille_commune_residence_11 = models.FloatField(null=True)
    travaille_autre_commune_11 = models.FloatField(null=True)
    travaille_autre_commune_meme_dept_11 = models.FloatField(null=True)
    travaille_autre_dept_meme_region_11 = models.FloatField(null=True)
    travaille_autre_region_11 = models.FloatField(null=True)
    travaille_hors_metropole_11 = models.FloatField(null=True)
    transport_aucun_11 = models.FloatField(null=True)
    transport_marche_11 = models.FloatField(null=True)
    transport_voiture_11 = models.FloatField(null=True)
    transport_commun_11 = models.FloatField(null=True)

    # P22 specifiques
    transport_velo_22 = models.FloatField(null=True)
    transport_deux_roues_motorise_22 = models.FloatField(null=True)

    # P16, P11 specifiques
    transport_deux_roues_16 = models.FloatField(null=True)
    transport_deux_roues_11 = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_deplacements_domicile_travail"
