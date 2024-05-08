from hashlib import md5
from pathlib import Path

from django.core.management import call_command
from django.test import TestCase

from public_data.models import DataSource


class TestBuildOcsge(TestCase):
    def setUp(self) -> None:
        DataSource.objects.all().delete()
        call_command("loaddata", "public_data/models/data_source_fixture.json")

    def test_build_ocsge(self):
        expected_files = {
            "OCSGE_DIFFERENCE_94_2018_2021_MDA.shp.zip": "bc88efabde67772612e9b3fd69b5842b",
            "OCSGE_OCCUPATION_DU_SOL_94_2018_MDA.shp.zip": "73db57d6273508860d9a122feffc1e6d",
            "OCSGE_OCCUPATION_DU_SOL_94_2021_MDA.shp.zip": "daaf29a4582e3ba2321d0f69c69b3dc5",
            "OCSGE_ZONE_ARTIFICIELLE_94_2018_MDA.shp.zip": "d3752cf997f6246deb267f6af6056566",
            "OCSGE_ZONE_ARTIFICIELLE_94_2021_MDA.shp.zip": "bf3a8863604dd3cee6a5a0461589236b",
            "OCSGE_ZONE_CONSTRUITE_94_2018_MDA.shp.zip": "46e023d2da74b5da5326710fee52098d",
            "OCSGE_ZONE_CONSTRUITE_94_2021_MDA.shp.zip": "a15ca3c91e6532d379a64f5f1df878e9",
        }

        call_command(
            command_name="build_shapefile",
            productor=DataSource.ProductorChoices.IGN,
            dataset=DataSource.DatasetChoices.OCSGE,
            millesimes=[2018, 2021],
            land_id="94",
        )

        for file, checksum in expected_files.items():
            self.assertTrue(Path(file).exists())
            self.assertEqual(
                md5(open(file, "rb").read()).hexdigest(),
                checksum,
            )
