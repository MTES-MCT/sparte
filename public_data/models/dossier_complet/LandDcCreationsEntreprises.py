from django.db import models

from public_data.models.administration import AdminRef


class LandDcCreationsEntreprises(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    # creations_entreprises par annee (range(12, 25) => 2012..2024)
    creations_entreprises_2012 = models.FloatField(null=True)
    creations_entreprises_2013 = models.FloatField(null=True)
    creations_entreprises_2014 = models.FloatField(null=True)
    creations_entreprises_2015 = models.FloatField(null=True)
    creations_entreprises_2016 = models.FloatField(null=True)
    creations_entreprises_2017 = models.FloatField(null=True)
    creations_entreprises_2018 = models.FloatField(null=True)
    creations_entreprises_2019 = models.FloatField(null=True)
    creations_entreprises_2020 = models.FloatField(null=True)
    creations_entreprises_2021 = models.FloatField(null=True)
    creations_entreprises_2022 = models.FloatField(null=True)
    creations_entreprises_2023 = models.FloatField(null=True)
    creations_entreprises_2024 = models.FloatField(null=True)

    # creations_individuelles par annee (range(12, 25) => 2012..2024)
    creations_individuelles_2012 = models.FloatField(null=True)
    creations_individuelles_2013 = models.FloatField(null=True)
    creations_individuelles_2014 = models.FloatField(null=True)
    creations_individuelles_2015 = models.FloatField(null=True)
    creations_individuelles_2016 = models.FloatField(null=True)
    creations_individuelles_2017 = models.FloatField(null=True)
    creations_individuelles_2018 = models.FloatField(null=True)
    creations_individuelles_2019 = models.FloatField(null=True)
    creations_individuelles_2020 = models.FloatField(null=True)
    creations_individuelles_2021 = models.FloatField(null=True)
    creations_individuelles_2022 = models.FloatField(null=True)
    creations_individuelles_2023 = models.FloatField(null=True)
    creations_individuelles_2024 = models.FloatField(null=True)

    # creations par secteur
    creations_industrie = models.FloatField(null=True)
    creations_construction = models.FloatField(null=True)
    creations_commerce_transports_hebergement = models.FloatField(null=True)
    creations_information_communication = models.FloatField(null=True)
    creations_finance_assurance = models.FloatField(null=True)
    creations_immobilier = models.FloatField(null=True)
    creations_services_entreprises = models.FloatField(null=True)
    creations_admin_enseignement_sante = models.FloatField(null=True)
    creations_autres_services = models.FloatField(null=True)

    # creations individuelles par secteur
    creations_individuelles_industrie = models.FloatField(null=True)
    creations_individuelles_construction = models.FloatField(null=True)
    creations_individuelles_commerce_transports_hebergement = models.FloatField(null=True)
    creations_individuelles_information_communication = models.FloatField(null=True)
    creations_individuelles_finance_assurance = models.FloatField(null=True)
    creations_individuelles_immobilier = models.FloatField(null=True)
    creations_individuelles_services_entreprises = models.FloatField(null=True)
    creations_individuelles_admin_enseignement_sante = models.FloatField(null=True)
    creations_individuelles_autres_services = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_creations_entreprises"
