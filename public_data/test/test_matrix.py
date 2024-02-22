from django.test import TestCase

from public_data.models import CouvertureSol, CouvertureUsageMatrix, UsageSol


class TestMatrix(TestCase):
    fixtures = [
        "public_data/models/fixtures/usage.json",
        "public_data/models/fixtures/couverture.json",
        "public_data/models/fixtures/matrix.json",
    ]

    def test_2_2_x_x_is_artificial_with_certain_usages(self):
        """
        Les polygones ayant une couverture de végétation non ligneuse (2.2.1.x)
        et un usage résidentiel (5) ou mixte (235) ou transport (4.1.x) ou zone
        en transition (6.1) ou abandonnées (6.2) ou production secondaire (2) ou
        tertiaire (3) sont catégorisés en artificialisés.
        """

        PRAIRIES = "2.2.1.1"
        PELOUSES = "2.2.1.2"
        TERRES_ARABLES = "2.2.1.4"
        AUTRES_FORMATIONS_HERBACEES = "2.2.1.5"
        FORMATIONS_HERBACEES_INCONNUES = "2.2.1.3"

        SECONDAIRE = "2"
        TERTIAIRE = "3"
        MIXTE = "235"
        ROUTIER = "4.1.1"
        FERRE = "4.1.2"
        AERIEN = "4.1.3"
        NAVIGABLE = "4.1.4"
        AUTRES_TRANSPORT = "4.1.5"
        RESIDENTIEL = "5"
        ZONE_TRANSITION = "6.1"
        ZONE_ABANDONNEE = "6.2"

        matrix = CouvertureUsageMatrix.objects.filter(
            couverture__in=CouvertureSol.objects.filter(
                code__in=[
                    PRAIRIES,
                    PELOUSES,
                    TERRES_ARABLES,
                    AUTRES_FORMATIONS_HERBACEES,
                    FORMATIONS_HERBACEES_INCONNUES,
                ]
            ),
            usage__in=UsageSol.objects.filter(
                code__in=[
                    SECONDAIRE,
                    TERTIAIRE,
                    RESIDENTIEL,
                    MIXTE,
                    ROUTIER,
                    FERRE,
                    AERIEN,
                    NAVIGABLE,
                    AUTRES_TRANSPORT,
                    ZONE_ABANDONNEE,
                    ZONE_TRANSITION,
                ]
            ),
        )

        assert matrix.filter(is_artificial=True).count() == matrix.count()

    def test_1_1_x_x_is_artificial_except_cs_1_1_2_1_with_us_1_3(self):
        """
        Les polygones ayant une couverture de classe 'surface anthropisée' (1.1.x.x)
        sauf ceux ayant à la fois une couverture « Zones à matériaux minéraux »
        (1.1.2.1) et un usage 'activités d'extraction' sont catégorisés en
        artificialisés.

        Liste des codes de surface anthropisées:
        https://artificialisation.developpement-durable.gouv.fr/sites/artificialisation/files/inline-files/Marque%20page_OCS_GE_sept2017_RV_V3-1_0.png
        """
        ZONES_A_MATERIEUX_MINERAUX = "1.1.2.1"
        ACTIVITE_D_EXTRACTION = "1.3"

        ZONES_BATIES = "1.1.1.1"
        ZONES_NON_BATIES = "1.1.1.2"
        MATERIAUX_MINERAUX = "1.1.2.1"
        MATERIAUX_COMPOSITE = "1.1.2.2"

        anthropized_matrix = CouvertureUsageMatrix.objects.filter(
            couverture__in=CouvertureSol.objects.filter(
                code__in=[ZONES_BATIES, ZONES_NON_BATIES, MATERIAUX_MINERAUX, MATERIAUX_COMPOSITE]
            )
        )

        mineral_extraction = CouvertureUsageMatrix.objects.get_by_natural_key(
            couverture=ZONES_A_MATERIEUX_MINERAUX,
            usage=ACTIVITE_D_EXTRACTION,
        )

        artificial_element_count = anthropized_matrix.filter(is_artificial=True).count()
        should_be_artificial_count = anthropized_matrix.count() - 1

        assert artificial_element_count == should_be_artificial_count
        assert mineral_extraction.is_artificial is False

    def test_level_match_rank_in_nomenclatura(self):
        assert UsageSol.objects.get_by_natural_key("1").level == 1
        assert UsageSol.objects.get_by_natural_key("1.1").level == 2
        assert CouvertureSol.objects.get_by_natural_key("1.2.2").level == 3
        assert CouvertureSol.objects.get_by_natural_key("1.1.1.1").level == 4
