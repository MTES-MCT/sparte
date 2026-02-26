from django.db import models

from public_data.models.administration import AdminRef


class LandDcCreationsEtablissements(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    # range(12, 25) => 2012..2024, each year: total + 9 secteurs
    # 2012
    creations_etablissements_2012 = models.FloatField(null=True)
    creations_etablissements_industrie_2012 = models.FloatField(null=True)
    creations_etablissements_construction_2012 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2012 = models.FloatField(null=True)
    creations_etablissements_information_communication_2012 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2012 = models.FloatField(null=True)
    creations_etablissements_immobilier_2012 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2012 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2012 = models.FloatField(null=True)
    creations_etablissements_autres_services_2012 = models.FloatField(null=True)

    # 2013
    creations_etablissements_2013 = models.FloatField(null=True)
    creations_etablissements_industrie_2013 = models.FloatField(null=True)
    creations_etablissements_construction_2013 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2013 = models.FloatField(null=True)
    creations_etablissements_information_communication_2013 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2013 = models.FloatField(null=True)
    creations_etablissements_immobilier_2013 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2013 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2013 = models.FloatField(null=True)
    creations_etablissements_autres_services_2013 = models.FloatField(null=True)

    # 2014
    creations_etablissements_2014 = models.FloatField(null=True)
    creations_etablissements_industrie_2014 = models.FloatField(null=True)
    creations_etablissements_construction_2014 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2014 = models.FloatField(null=True)
    creations_etablissements_information_communication_2014 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2014 = models.FloatField(null=True)
    creations_etablissements_immobilier_2014 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2014 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2014 = models.FloatField(null=True)
    creations_etablissements_autres_services_2014 = models.FloatField(null=True)

    # 2015
    creations_etablissements_2015 = models.FloatField(null=True)
    creations_etablissements_industrie_2015 = models.FloatField(null=True)
    creations_etablissements_construction_2015 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2015 = models.FloatField(null=True)
    creations_etablissements_information_communication_2015 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2015 = models.FloatField(null=True)
    creations_etablissements_immobilier_2015 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2015 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2015 = models.FloatField(null=True)
    creations_etablissements_autres_services_2015 = models.FloatField(null=True)

    # 2016
    creations_etablissements_2016 = models.FloatField(null=True)
    creations_etablissements_industrie_2016 = models.FloatField(null=True)
    creations_etablissements_construction_2016 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2016 = models.FloatField(null=True)
    creations_etablissements_information_communication_2016 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2016 = models.FloatField(null=True)
    creations_etablissements_immobilier_2016 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2016 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2016 = models.FloatField(null=True)
    creations_etablissements_autres_services_2016 = models.FloatField(null=True)

    # 2017
    creations_etablissements_2017 = models.FloatField(null=True)
    creations_etablissements_industrie_2017 = models.FloatField(null=True)
    creations_etablissements_construction_2017 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2017 = models.FloatField(null=True)
    creations_etablissements_information_communication_2017 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2017 = models.FloatField(null=True)
    creations_etablissements_immobilier_2017 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2017 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2017 = models.FloatField(null=True)
    creations_etablissements_autres_services_2017 = models.FloatField(null=True)

    # 2018
    creations_etablissements_2018 = models.FloatField(null=True)
    creations_etablissements_industrie_2018 = models.FloatField(null=True)
    creations_etablissements_construction_2018 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2018 = models.FloatField(null=True)
    creations_etablissements_information_communication_2018 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2018 = models.FloatField(null=True)
    creations_etablissements_immobilier_2018 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2018 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2018 = models.FloatField(null=True)
    creations_etablissements_autres_services_2018 = models.FloatField(null=True)

    # 2019
    creations_etablissements_2019 = models.FloatField(null=True)
    creations_etablissements_industrie_2019 = models.FloatField(null=True)
    creations_etablissements_construction_2019 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2019 = models.FloatField(null=True)
    creations_etablissements_information_communication_2019 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2019 = models.FloatField(null=True)
    creations_etablissements_immobilier_2019 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2019 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2019 = models.FloatField(null=True)
    creations_etablissements_autres_services_2019 = models.FloatField(null=True)

    # 2020
    creations_etablissements_2020 = models.FloatField(null=True)
    creations_etablissements_industrie_2020 = models.FloatField(null=True)
    creations_etablissements_construction_2020 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2020 = models.FloatField(null=True)
    creations_etablissements_information_communication_2020 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2020 = models.FloatField(null=True)
    creations_etablissements_immobilier_2020 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2020 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2020 = models.FloatField(null=True)
    creations_etablissements_autres_services_2020 = models.FloatField(null=True)

    # 2021
    creations_etablissements_2021 = models.FloatField(null=True)
    creations_etablissements_industrie_2021 = models.FloatField(null=True)
    creations_etablissements_construction_2021 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2021 = models.FloatField(null=True)
    creations_etablissements_information_communication_2021 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2021 = models.FloatField(null=True)
    creations_etablissements_immobilier_2021 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2021 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2021 = models.FloatField(null=True)
    creations_etablissements_autres_services_2021 = models.FloatField(null=True)

    # 2022
    creations_etablissements_2022 = models.FloatField(null=True)
    creations_etablissements_industrie_2022 = models.FloatField(null=True)
    creations_etablissements_construction_2022 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2022 = models.FloatField(null=True)
    creations_etablissements_information_communication_2022 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2022 = models.FloatField(null=True)
    creations_etablissements_immobilier_2022 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2022 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2022 = models.FloatField(null=True)
    creations_etablissements_autres_services_2022 = models.FloatField(null=True)

    # 2023
    creations_etablissements_2023 = models.FloatField(null=True)
    creations_etablissements_industrie_2023 = models.FloatField(null=True)
    creations_etablissements_construction_2023 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2023 = models.FloatField(null=True)
    creations_etablissements_information_communication_2023 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2023 = models.FloatField(null=True)
    creations_etablissements_immobilier_2023 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2023 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2023 = models.FloatField(null=True)
    creations_etablissements_autres_services_2023 = models.FloatField(null=True)

    # 2024
    creations_etablissements_2024 = models.FloatField(null=True)
    creations_etablissements_industrie_2024 = models.FloatField(null=True)
    creations_etablissements_construction_2024 = models.FloatField(null=True)
    creations_etablissements_commerce_transports_hebergement_2024 = models.FloatField(null=True)
    creations_etablissements_information_communication_2024 = models.FloatField(null=True)
    creations_etablissements_finance_assurance_2024 = models.FloatField(null=True)
    creations_etablissements_immobilier_2024 = models.FloatField(null=True)
    creations_etablissements_services_entreprises_2024 = models.FloatField(null=True)
    creations_etablissements_admin_enseignement_sante_2024 = models.FloatField(null=True)
    creations_etablissements_autres_services_2024 = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_creations_etablissements"
