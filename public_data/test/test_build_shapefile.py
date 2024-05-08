from pathlib import Path

from django.core.management import call_command
from django.test import TestCase

from public_data.models import DataSource


class TestBuildOcsge(TestCase):
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
            millesimes=[2018, 2021],
            land_id="94",
        )

        for file in expected_files:
            self.assertTrue(Path(file).exists())
