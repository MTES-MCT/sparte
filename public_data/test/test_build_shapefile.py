from pathlib import Path

from django.core.management import call_command
from django.db import connection
from django.test import TransactionTestCase

from public_data.domain.shapefile_builder.infra.gdal.is_artif_case import is_artif_case
from public_data.models import DataSource


class TestBuildOcsge(TransactionTestCase):
    def setUp(self) -> None:
        DataSource.objects.all().delete()
        call_command("loaddata", "public_data/models/data_source_fixture.json")

    def test_build_ocsge(self):
        expected_files = [
            "OCSGE_DIFFERENCE_94_2018_2021_MDA.shp.zip",
            "OCSGE_OCCUPATION_DU_SOL_94_2018_MDA.shp.zip",
            "OCSGE_OCCUPATION_DU_SOL_94_2021_MDA.shp.zip",
            "OCSGE_ZONE_ARTIFICIELLE_94_2018_MDA.shp.zip",
            "OCSGE_ZONE_ARTIFICIELLE_94_2021_MDA.shp.zip",
            "OCSGE_ZONE_CONSTRUITE_94_2018_MDA.shp.zip",
            "OCSGE_ZONE_CONSTRUITE_94_2021_MDA.shp.zip",
        ]

        call_command(
            command_name="build_shapefile",
            productor=DataSource.ProductorChoices.IGN,
            dataset=DataSource.DatasetChoices.OCSGE,
            land_id="94",
        )

        for file in expected_files:
            self.assertTrue(Path(file).exists())

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
