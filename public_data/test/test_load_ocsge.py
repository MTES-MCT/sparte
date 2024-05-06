from django.core.management import call_command
from django.test import TestCase

from public_data.models import (
    ArtificialArea,
    DataSource,
    Ocsge,
    OcsgeDiff,
    ZoneConstruite,
)


class TestImportOCSGE(TestCase):
    def setUp(self) -> None:
        DataSource.objects.all().delete()
        call_command("loaddata", "public_data/models/data_source_fixture.json")

    def test_import_ocsge_94(self) -> None:
        before_expected = {
            Ocsge: 0,
            OcsgeDiff: 0,
            ZoneConstruite: 0,
            ArtificialArea: 0,
        }

        after_expected = {
            Ocsge: 2385819,
            OcsgeDiff: 5190,
            ZoneConstruite: 2,
            ArtificialArea: 2,
        }

        for model, expected in before_expected.items():
            self.assertEqual(model.objects.filter(departement="94").count(), expected)

        call_command(
            command_name="load_shapefile",
            land_id="94",
            dataset=DataSource.DatasetChoices.OCSGE,
            millesimes=[2018, 2021],
        )

        for model, expected in after_expected.items():
            self.assertEqual(model.objects.filter(departement="94").count(), expected)

        call_command(
            command_name="load_shapefile",
            land_id="94",
            dataset=DataSource.DatasetChoices.OCSGE,
            millesimes=[2018, 2021],
        )

        for model, expected in after_expected.items():
            self.assertEqual(model.objects.filter(departement="94").count(), expected)
