from django.db import models

from public_data.models.administration import AdminRef


class LandDcTourisme(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    # Hotels
    hotels_total = models.FloatField(null=True)
    hotels_non_classes = models.FloatField(null=True)
    hotels_1_etoile = models.FloatField(null=True)
    hotels_2_etoiles = models.FloatField(null=True)
    hotels_3_etoiles = models.FloatField(null=True)
    hotels_4_etoiles = models.FloatField(null=True)
    hotels_5_etoiles = models.FloatField(null=True)

    hotels_chambres_total = models.FloatField(null=True)
    hotels_chambres_non_classes = models.FloatField(null=True)
    hotels_chambres_1_etoile = models.FloatField(null=True)
    hotels_chambres_2_etoiles = models.FloatField(null=True)
    hotels_chambres_3_etoiles = models.FloatField(null=True)
    hotels_chambres_4_etoiles = models.FloatField(null=True)
    hotels_chambres_5_etoiles = models.FloatField(null=True)

    # Campings
    campings_total = models.FloatField(null=True)
    campings_non_classes = models.FloatField(null=True)
    campings_1_etoile = models.FloatField(null=True)
    campings_2_etoiles = models.FloatField(null=True)
    campings_3_etoiles = models.FloatField(null=True)
    campings_4_etoiles = models.FloatField(null=True)
    campings_5_etoiles = models.FloatField(null=True)

    campings_emplacements_total = models.FloatField(null=True)
    campings_emplacements_non_classes = models.FloatField(null=True)
    campings_emplacements_1_etoile = models.FloatField(null=True)
    campings_emplacements_2_etoiles = models.FloatField(null=True)
    campings_emplacements_3_etoiles = models.FloatField(null=True)
    campings_emplacements_4_etoiles = models.FloatField(null=True)
    campings_emplacements_5_etoiles = models.FloatField(null=True)

    campings_emplacements_annee_total = models.FloatField(null=True)
    campings_emplacements_annee_non_classes = models.FloatField(null=True)
    campings_emplacements_annee_1_etoile = models.FloatField(null=True)
    campings_emplacements_annee_2_etoiles = models.FloatField(null=True)
    campings_emplacements_annee_3_etoiles = models.FloatField(null=True)
    campings_emplacements_annee_4_etoiles = models.FloatField(null=True)
    campings_emplacements_annee_5_etoiles = models.FloatField(null=True)

    campings_emplacements_passage_total = models.FloatField(null=True)
    campings_emplacements_passage_non_classes = models.FloatField(null=True)
    campings_emplacements_passage_1_etoile = models.FloatField(null=True)
    campings_emplacements_passage_2_etoiles = models.FloatField(null=True)
    campings_emplacements_passage_3_etoiles = models.FloatField(null=True)
    campings_emplacements_passage_4_etoiles = models.FloatField(null=True)
    campings_emplacements_passage_5_etoiles = models.FloatField(null=True)

    # Autres hebergements
    villages_vacances = models.FloatField(null=True)
    villages_vacances_unites = models.FloatField(null=True)
    villages_vacances_lits = models.FloatField(null=True)
    residences_tourisme = models.FloatField(null=True)
    residences_tourisme_unites = models.FloatField(null=True)
    residences_tourisme_lits = models.FloatField(null=True)
    auberges_jeunesse = models.FloatField(null=True)
    auberges_jeunesse_unites = models.FloatField(null=True)
    auberges_jeunesse_lits = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_tourisme"
