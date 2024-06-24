from django.db import connection
from django.test import TransactionTestCase

from .is_artif_case import is_artif_case
from .is_impermeable_case import is_impermeable_case


class TestGdalShapefileBuilder(TransactionTestCase):
    def test_carriere_is_not_artif(self):
        couverture = "CS1.1.2.1"  # zones à matériaux minéraux
        usage = "US1.3"  # activité d'extraction

        query = f"""
            WITH test_data AS (
                SELECT
                    '{couverture}' AS code_cs,
                    '{usage}' AS code_us
            )
            SELECT
                {is_artif_case(
                    code_cs="code_cs",
                    code_us="code_us",
                )}
            FROM
                test_data
            """

        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchone()

        self.assertEqual(result[0], 0)

    def test_only_zone_baties_and_zones_non_baties_are_impermeable(self):
        impermeable_couvertures = [
            "CS1.1.1.1",  # Zones bâties
            "CS1.1.1.2",  # Zones non bâties
        ]

        non_impermeable_couvertures = [
            "CS1.1.2.1",  # zones à matériaux minéraux
            "CS1.1.2.2",  # zones à matériaux composites
            "CS1.2.1",  # sol nuls
            "CS1.2.2",  # eau
            "CS1.2.3",  # nevé et glaciers
            "CS2.1.1.1",  # peuplement de feuillus
            "CS2.1.1.2",  # peuplement de conifères
            "CS2.1.1.3",  # peuplement mixte
            "CS2.1.2",  # formations arbustives et sous-abrisseaux
            "CS2.1.3",  # autres formations ligneuses
            "CS2.2.1",  # prairies
            "CS2.2.2",  # autres formations non ligneuses
        ]

        def get_query(couverture):
            return f"""
            WITH test_data AS (
                SELECT
                    '{couverture}' AS code_cs
            )
            SELECT
                {is_impermeable_case(
                    code_cs="code_cs",
                )}
            FROM
                test_data
            """

        for couverture in impermeable_couvertures:
            with connection.cursor() as cursor:
                cursor.execute(get_query(couverture))
                result = cursor.fetchone()

            self.assertEqual(result[0], 1)

        for couverture in non_impermeable_couvertures:
            with connection.cursor() as cursor:
                cursor.execute(get_query(couverture))
                result = cursor.fetchone()

            self.assertEqual(result[0], 0)
