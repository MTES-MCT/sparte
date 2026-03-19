from django.db import models

from public_data.models.administration import AdminRef


class LandDcEquipementsBpe(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    coiffure = models.FloatField(null=True)
    hypermarche = models.FloatField(null=True)
    supermarche = models.FloatField(null=True)
    superette = models.FloatField(null=True)
    epicerie = models.FloatField(null=True)
    boulangerie = models.FloatField(null=True)
    station_service = models.FloatField(null=True)
    borne_recharge_electrique = models.FloatField(null=True)
    ecole_maternelle = models.FloatField(null=True)
    ecole_primaire = models.FloatField(null=True)
    ecole_elementaire = models.FloatField(null=True)
    college = models.FloatField(null=True)
    lycee_general_technologique = models.FloatField(null=True)
    lycee_professionnel = models.FloatField(null=True)
    lycee_agricole = models.FloatField(null=True)
    enseignement_gen_tech_lycee_pro = models.FloatField(null=True)
    enseignement_pro_lycee_gen_tech = models.FloatField(null=True)
    medecin_generaliste = models.FloatField(null=True)
    chirurgien_dentiste = models.FloatField(null=True)
    masseur_kinesitherapeute = models.FloatField(null=True)
    infirmier = models.FloatField(null=True)
    psychologue = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_equipements_bpe"
