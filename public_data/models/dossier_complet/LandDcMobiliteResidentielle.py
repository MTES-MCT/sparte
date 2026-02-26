from django.db import models

from public_data.models.administration import AdminRef


class LandDcMobiliteResidentielle(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    # year 22
    pop_1an_plus_22 = models.FloatField(null=True)
    pop_meme_logement_22 = models.FloatField(null=True)
    pop_autre_logement_meme_commune_22 = models.FloatField(null=True)
    pop_autre_commune_meme_dept_22 = models.FloatField(null=True)
    pop_autre_dept_meme_region_22 = models.FloatField(null=True)
    pop_autre_region_metropole_22 = models.FloatField(null=True)
    pop_dom_22 = models.FloatField(null=True)
    pop_hors_metro_dom_22 = models.FloatField(null=True)
    pop_0_14_autre_logement_22 = models.FloatField(null=True)
    pop_0_14_autre_logt_meme_commune_22 = models.FloatField(null=True)
    pop_0_14_autre_commune_22 = models.FloatField(null=True)
    pop_15_24_autre_logement_22 = models.FloatField(null=True)
    pop_15_24_autre_logt_meme_commune_22 = models.FloatField(null=True)
    pop_15_24_autre_commune_22 = models.FloatField(null=True)
    pop_25_54_autre_logement_22 = models.FloatField(null=True)
    pop_25_54_autre_logt_meme_commune_22 = models.FloatField(null=True)
    pop_25_54_autre_commune_22 = models.FloatField(null=True)
    pop_55_plus_autre_logement_22 = models.FloatField(null=True)
    pop_55_plus_autre_logt_meme_commune_22 = models.FloatField(null=True)
    pop_55_plus_autre_commune_22 = models.FloatField(null=True)

    # year 16
    pop_1an_plus_16 = models.FloatField(null=True)
    pop_meme_logement_16 = models.FloatField(null=True)
    pop_autre_logement_meme_commune_16 = models.FloatField(null=True)
    pop_autre_commune_meme_dept_16 = models.FloatField(null=True)
    pop_autre_dept_meme_region_16 = models.FloatField(null=True)
    pop_autre_region_metropole_16 = models.FloatField(null=True)
    pop_dom_16 = models.FloatField(null=True)
    pop_hors_metro_dom_16 = models.FloatField(null=True)
    pop_0_14_autre_logement_16 = models.FloatField(null=True)
    pop_0_14_autre_logt_meme_commune_16 = models.FloatField(null=True)
    pop_0_14_autre_commune_16 = models.FloatField(null=True)
    pop_15_24_autre_logement_16 = models.FloatField(null=True)
    pop_15_24_autre_logt_meme_commune_16 = models.FloatField(null=True)
    pop_15_24_autre_commune_16 = models.FloatField(null=True)
    pop_25_54_autre_logement_16 = models.FloatField(null=True)
    pop_25_54_autre_logt_meme_commune_16 = models.FloatField(null=True)
    pop_25_54_autre_commune_16 = models.FloatField(null=True)
    pop_55_plus_autre_logement_16 = models.FloatField(null=True)
    pop_55_plus_autre_logt_meme_commune_16 = models.FloatField(null=True)
    pop_55_plus_autre_commune_16 = models.FloatField(null=True)

    # year 11
    pop_1an_plus_11 = models.FloatField(null=True)
    pop_meme_logement_11 = models.FloatField(null=True)
    pop_autre_logement_meme_commune_11 = models.FloatField(null=True)
    pop_autre_commune_meme_dept_11 = models.FloatField(null=True)
    pop_autre_dept_meme_region_11 = models.FloatField(null=True)
    pop_autre_region_metropole_11 = models.FloatField(null=True)
    pop_dom_11 = models.FloatField(null=True)
    pop_hors_metro_dom_11 = models.FloatField(null=True)
    pop_0_14_autre_logement_11 = models.FloatField(null=True)
    pop_0_14_autre_logt_meme_commune_11 = models.FloatField(null=True)
    pop_0_14_autre_commune_11 = models.FloatField(null=True)
    pop_15_24_autre_logement_11 = models.FloatField(null=True)
    pop_15_24_autre_logt_meme_commune_11 = models.FloatField(null=True)
    pop_15_24_autre_commune_11 = models.FloatField(null=True)
    pop_25_54_autre_logement_11 = models.FloatField(null=True)
    pop_25_54_autre_logt_meme_commune_11 = models.FloatField(null=True)
    pop_25_54_autre_commune_11 = models.FloatField(null=True)
    pop_55_plus_autre_logement_11 = models.FloatField(null=True)
    pop_55_plus_autre_logt_meme_commune_11 = models.FloatField(null=True)
    pop_55_plus_autre_commune_11 = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_mobilite_residentielle"
