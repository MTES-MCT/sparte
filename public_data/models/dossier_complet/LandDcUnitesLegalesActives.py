from django.db import models

from public_data.models.administration import AdminRef


class LandDcUnitesLegalesActives(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    unites_legales_total = models.FloatField(null=True)
    unites_legales_industrie = models.FloatField(null=True)
    unites_legales_construction = models.FloatField(null=True)
    unites_legales_commerce_transports_hebergement = models.FloatField(null=True)
    unites_legales_information_communication = models.FloatField(null=True)
    unites_legales_finance_assurance = models.FloatField(null=True)
    unites_legales_immobilier = models.FloatField(null=True)
    unites_legales_services_entreprises = models.FloatField(null=True)
    unites_legales_admin_enseignement_sante = models.FloatField(null=True)
    unites_legales_autres_services = models.FloatField(null=True)

    etablissements_actifs_total = models.FloatField(null=True)
    etablissements_actifs_industrie = models.FloatField(null=True)
    etablissements_actifs_construction = models.FloatField(null=True)
    etablissements_actifs_commerce_transports_hebergement = models.FloatField(null=True)
    etablissements_actifs_information_communication = models.FloatField(null=True)
    etablissements_actifs_finance_assurance = models.FloatField(null=True)
    etablissements_actifs_immobilier = models.FloatField(null=True)
    etablissements_actifs_services_entreprises = models.FloatField(null=True)
    etablissements_actifs_admin_enseignement_sante = models.FloatField(null=True)
    etablissements_actifs_autres_services = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_unites_legales_actives"
