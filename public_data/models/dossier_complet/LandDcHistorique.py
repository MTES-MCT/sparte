from django.db import models

from public_data.models.administration import AdminRef


class LandDcHistorique(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    # Population et logement P06
    population_06 = models.FloatField(null=True)
    logements_06 = models.FloatField(null=True)
    residences_principales_06 = models.FloatField(null=True)
    residences_secondaires_06 = models.FloatField(null=True)
    logements_vacants_06 = models.FloatField(null=True)
    pop_menages_06 = models.FloatField(null=True)

    # D99
    population_99 = models.FloatField(null=True)
    logements_99 = models.FloatField(null=True)
    residences_principales_99 = models.FloatField(null=True)
    residences_secondaires_99 = models.FloatField(null=True)
    logements_vacants_99 = models.FloatField(null=True)
    # D90
    population_90 = models.FloatField(null=True)
    logements_90 = models.FloatField(null=True)
    residences_principales_90 = models.FloatField(null=True)
    residences_secondaires_90 = models.FloatField(null=True)
    logements_vacants_90 = models.FloatField(null=True)
    # D82
    population_82 = models.FloatField(null=True)
    logements_82 = models.FloatField(null=True)
    residences_principales_82 = models.FloatField(null=True)
    residences_secondaires_82 = models.FloatField(null=True)
    logements_vacants_82 = models.FloatField(null=True)
    # D75
    population_75 = models.FloatField(null=True)
    logements_75 = models.FloatField(null=True)
    residences_principales_75 = models.FloatField(null=True)
    residences_secondaires_75 = models.FloatField(null=True)
    logements_vacants_75 = models.FloatField(null=True)
    # D68
    population_68 = models.FloatField(null=True)
    logements_68 = models.FloatField(null=True)
    residences_principales_68 = models.FloatField(null=True)
    residences_secondaires_68 = models.FloatField(null=True)
    logements_vacants_68 = models.FloatField(null=True)

    pop_menages_99 = models.FloatField(null=True)
    nb_personnes_rp_90 = models.FloatField(null=True)
    nb_personnes_rp_82 = models.FloatField(null=True)
    nb_personnes_rp_75 = models.FloatField(null=True)
    nb_personnes_rp_68 = models.FloatField(null=True)
    superficie = models.FloatField(null=True)

    # Naissances/deces inter-censitaires
    naissances_2016_2021 = models.FloatField(null=True)
    deces_2016_2021 = models.FloatField(null=True)
    naissances_2011_2015 = models.FloatField(null=True)
    deces_2011_2015 = models.FloatField(null=True)
    naissances_2006_2010 = models.FloatField(null=True)
    deces_2006_2010 = models.FloatField(null=True)
    naissances_1999_2005 = models.FloatField(null=True)
    deces_1999_2005 = models.FloatField(null=True)
    naissances_1990_1999 = models.FloatField(null=True)
    deces_1990_1999 = models.FloatField(null=True)
    naissances_1982_1990 = models.FloatField(null=True)
    deces_1982_1990 = models.FloatField(null=True)
    naissances_1975_1982 = models.FloatField(null=True)
    deces_1975_1982 = models.FloatField(null=True)
    naissances_1968_1975 = models.FloatField(null=True)
    deces_1968_1975 = models.FloatField(null=True)

    # Naissances/deces annuels (range(14, 25) => 2014..2024)
    naissances_domiciliees_2014 = models.FloatField(null=True)
    deces_domicilies_2014 = models.FloatField(null=True)
    naissances_domiciliees_2015 = models.FloatField(null=True)
    deces_domicilies_2015 = models.FloatField(null=True)
    naissances_domiciliees_2016 = models.FloatField(null=True)
    deces_domicilies_2016 = models.FloatField(null=True)
    naissances_domiciliees_2017 = models.FloatField(null=True)
    deces_domicilies_2017 = models.FloatField(null=True)
    naissances_domiciliees_2018 = models.FloatField(null=True)
    deces_domicilies_2018 = models.FloatField(null=True)
    naissances_domiciliees_2019 = models.FloatField(null=True)
    deces_domicilies_2019 = models.FloatField(null=True)
    naissances_domiciliees_2020 = models.FloatField(null=True)
    deces_domicilies_2020 = models.FloatField(null=True)
    naissances_domiciliees_2021 = models.FloatField(null=True)
    deces_domicilies_2021 = models.FloatField(null=True)
    naissances_domiciliees_2022 = models.FloatField(null=True)
    deces_domicilies_2022 = models.FloatField(null=True)
    naissances_domiciliees_2023 = models.FloatField(null=True)
    deces_domicilies_2023 = models.FloatField(null=True)
    naissances_domiciliees_2024 = models.FloatField(null=True)
    deces_domicilies_2024 = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_historique"
