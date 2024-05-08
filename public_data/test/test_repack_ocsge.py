from hashlib import md5
from pathlib import Path

from django.core.management import call_command
from django.test import TestCase

from public_data.models import DataSource


class TestRepackOcsge(TestCase):
    def setUp(self) -> None:
        self.expected_files = {
            "94_DIFFERENCE_2018_2021_IGN_REPACKED.shp.zip": "ef0f7f02ca9e7e9ca4a27ab6634a08c7",
            "94_OCCUPATION_DU_SOL_2018_IGN_REPACKED.shp.zip": "779f9ffdb39489a34839d61a40037720",
            "94_OCCUPATION_DU_SOL_2021_IGN_REPACKED.shp.zip": "8d161c65aac9ce01efb29251ee8f6924",
            "94_ZONE_CONSTRUITE_2018_IGN_REPACKED.shp.zip": "b65e61ebfd7c7c68f779ec39b59bea28",
            "94_ZONE_CONSTRUITE_2021_IGN_REPACKED.shp.zip": "4cf92e7475a65936304d7ac8743781b6",
        }

    def tearDown(self) -> None:
        for file in self.expected_files:
            Path(file).unlink()
            print(file)

    def test_repack_ocsge_94(self) -> None:
        urls = [
            "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D094_2021-01-01/OCS-GE_2-0__SHP_LAMB93_D094_2021-01-01.7z",  # noqa: E501
            "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE_2-0__SHP_LAMB93_D094_2018-01-01/OCS-GE_2-0__SHP_LAMB93_D094_2018-01-01.7z",  # noqa: E501
            "https://data.geopf.fr/telechargement/download/OCSGE/OCS-GE-NG_1-1_DIFF_SHP_LAMB93_D094_2018-2021/OCS-GE-NG_1-1_DIFF_SHP_LAMB93_D094_2018-2021.7z",  # noqa: E501
        ]

        expected_data_sources = [
            {
                "dataset": DataSource.DatasetChoices.OCSGE,
                "name": DataSource.DataNameChoices.OCCUPATION_DU_SOL,
                "productor": DataSource.ProductorChoices.IGN,
                "millesimes": [2018],
                "srid": 2154,
            },
            {
                "dataset": DataSource.DatasetChoices.OCSGE,
                "name": DataSource.DataNameChoices.OCCUPATION_DU_SOL,
                "productor": DataSource.ProductorChoices.IGN,
                "millesimes": [2021],
                "srid": 2154,
            },
            {
                "dataset": DataSource.DatasetChoices.OCSGE,
                "name": DataSource.DataNameChoices.DIFFERENCE,
                "productor": DataSource.ProductorChoices.IGN,
                "millesimes": [2018, 2021],
                "srid": 2154,
            },
            {
                "dataset": DataSource.DatasetChoices.OCSGE,
                "name": DataSource.DataNameChoices.ZONE_CONSTRUITE,
                "productor": DataSource.ProductorChoices.IGN,
                "millesimes": [2018],
                "srid": 2154,
            },
            {
                "dataset": DataSource.DatasetChoices.OCSGE,
                "name": DataSource.DataNameChoices.DIFFERENCE,
                "productor": DataSource.ProductorChoices.IGN,
                "millesimes": [2018, 2021],
                "srid": 2154,
            },
        ]

        call_command(command_name="repack_ocsge", urls=urls)

        for file, checksum in self.expected_files.items():
            self.assertTrue(Path(file).exists())
            self.assertEqual(
                md5(open(file, "rb").read()).hexdigest(),
                checksum,
            )

        for data_source in expected_data_sources:
            self.assertTrue(
                DataSource.objects.filter(**data_source).exists(),
                f"Data source {data_source} not found",
            )
