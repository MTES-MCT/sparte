from django.db import models

from public_data.models.administration import AdminRef


class LandDcMenages(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    # year 22 - p_indicators
    menages_22 = models.FloatField(null=True)
    menages_emmenages_moins_2_ans_22 = models.FloatField(null=True)
    menages_emmenages_2_4_ans_22 = models.FloatField(null=True)
    menages_emmenages_5_9_ans_22 = models.FloatField(null=True)
    menages_emmenages_10_ans_plus_22 = models.FloatField(null=True)
    personnes_menages_22 = models.FloatField(null=True)
    personnes_menages_moins_2_ans_22 = models.FloatField(null=True)
    personnes_menages_2_4_ans_22 = models.FloatField(null=True)
    personnes_menages_5_9_ans_22 = models.FloatField(null=True)
    personnes_menages_10_ans_plus_22 = models.FloatField(null=True)
    nb_personnes_rp_22 = models.FloatField(null=True)
    nb_personnes_rp_proprietaires_22 = models.FloatField(null=True)
    nb_personnes_rp_locataires_22 = models.FloatField(null=True)
    nb_personnes_rp_hlm_22 = models.FloatField(null=True)
    nb_personnes_rp_gratuit_22 = models.FloatField(null=True)
    # year 22 - c_indicators
    familles_22 = models.FloatField(null=True)
    familles_monoparentales_22 = models.FloatField(null=True)
    familles_0_enfant_moins_25_22 = models.FloatField(null=True)
    familles_1_enfant_moins_25_22 = models.FloatField(null=True)
    familles_2_enfants_moins_25_22 = models.FloatField(null=True)
    familles_3_enfants_moins_25_22 = models.FloatField(null=True)
    familles_4_enfants_plus_moins_25_22 = models.FloatField(null=True)

    # year 16 - p_indicators
    menages_16 = models.FloatField(null=True)
    menages_emmenages_moins_2_ans_16 = models.FloatField(null=True)
    menages_emmenages_2_4_ans_16 = models.FloatField(null=True)
    menages_emmenages_5_9_ans_16 = models.FloatField(null=True)
    menages_emmenages_10_ans_plus_16 = models.FloatField(null=True)
    personnes_menages_16 = models.FloatField(null=True)
    personnes_menages_moins_2_ans_16 = models.FloatField(null=True)
    personnes_menages_2_4_ans_16 = models.FloatField(null=True)
    personnes_menages_5_9_ans_16 = models.FloatField(null=True)
    personnes_menages_10_ans_plus_16 = models.FloatField(null=True)
    nb_personnes_rp_16 = models.FloatField(null=True)
    nb_personnes_rp_proprietaires_16 = models.FloatField(null=True)
    nb_personnes_rp_locataires_16 = models.FloatField(null=True)
    nb_personnes_rp_hlm_16 = models.FloatField(null=True)
    nb_personnes_rp_gratuit_16 = models.FloatField(null=True)
    # year 16 - c_indicators
    familles_16 = models.FloatField(null=True)
    familles_monoparentales_16 = models.FloatField(null=True)
    familles_0_enfant_moins_25_16 = models.FloatField(null=True)
    familles_1_enfant_moins_25_16 = models.FloatField(null=True)
    familles_2_enfants_moins_25_16 = models.FloatField(null=True)
    familles_3_enfants_moins_25_16 = models.FloatField(null=True)
    familles_4_enfants_plus_moins_25_16 = models.FloatField(null=True)

    # year 11 - p_indicators
    menages_11 = models.FloatField(null=True)
    menages_emmenages_moins_2_ans_11 = models.FloatField(null=True)
    menages_emmenages_2_4_ans_11 = models.FloatField(null=True)
    menages_emmenages_5_9_ans_11 = models.FloatField(null=True)
    menages_emmenages_10_ans_plus_11 = models.FloatField(null=True)
    personnes_menages_11 = models.FloatField(null=True)
    personnes_menages_moins_2_ans_11 = models.FloatField(null=True)
    personnes_menages_2_4_ans_11 = models.FloatField(null=True)
    personnes_menages_5_9_ans_11 = models.FloatField(null=True)
    personnes_menages_10_ans_plus_11 = models.FloatField(null=True)
    nb_personnes_rp_11 = models.FloatField(null=True)
    nb_personnes_rp_proprietaires_11 = models.FloatField(null=True)
    nb_personnes_rp_locataires_11 = models.FloatField(null=True)
    nb_personnes_rp_hlm_11 = models.FloatField(null=True)
    nb_personnes_rp_gratuit_11 = models.FloatField(null=True)
    # year 11 - c_indicators
    familles_11 = models.FloatField(null=True)
    familles_monoparentales_11 = models.FloatField(null=True)
    familles_0_enfant_moins_25_11 = models.FloatField(null=True)
    familles_1_enfant_moins_25_11 = models.FloatField(null=True)
    familles_2_enfants_moins_25_11 = models.FloatField(null=True)
    familles_3_enfants_moins_25_11 = models.FloatField(null=True)
    familles_4_enfants_plus_moins_25_11 = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_menages"
