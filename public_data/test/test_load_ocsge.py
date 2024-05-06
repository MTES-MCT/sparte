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
        self.departement_id = "94"
        self.first_year = 2018
        self.last_year = 2021

    def __check_count(self, expected: dict) -> None:
        self.assertEqual(
            Ocsge.objects.filter(
                departement=self.departement_id,
                year=self.first_year,
            ).count(),
            expected[Ocsge][self.first_year],
        )

        self.assertEqual(
            Ocsge.objects.filter(
                departement=self.departement_id,
                year=self.last_year,
            ).count(),
            expected[Ocsge][self.last_year],
        )

        self.assertEqual(
            OcsgeDiff.objects.filter(
                departement=self.departement_id,
                year_old=self.first_year,
                year_new=self.last_year,
            ).count(),
            expected[OcsgeDiff],
        )

        self.assertEqual(
            ZoneConstruite.objects.filter(
                departement=self.departement_id,
                year=self.first_year,
            ).count(),
            expected[ZoneConstruite][self.first_year],
        )

        self.assertEqual(
            ZoneConstruite.objects.filter(
                departement=self.departement_id,
                year=self.last_year,
            ).count(),
            expected[ZoneConstruite][self.last_year],
        )

        self.assertEqual(
            ArtificialArea.objects.filter(
                departement=self.departement_id,
                year=self.first_year,
            ).count(),
            expected[ArtificialArea][self.first_year],
        )

        self.assertEqual(
            ArtificialArea.objects.filter(
                departement=self.departement_id,
                year=self.last_year,
            ).count(),
            expected[ArtificialArea][self.last_year],
        )

    def test_import_ocsge_94(self) -> None:
        before_expected = {
            Ocsge: {
                self.first_year: 0,
                self.last_year: 0,
            },
            OcsgeDiff: 0,
            ZoneConstruite: {
                self.first_year: 0,
                self.last_year: 0,
            },
            ArtificialArea: {
                self.first_year: 0,
                self.last_year: 0,
            },
        }

        after_expected = {
            Ocsge: {
                self.first_year: 81081,
                self.last_year: 82260,
            },
            OcsgeDiff: 5190,
            ZoneConstruite: {
                self.first_year: 226,
                self.last_year: 238,
            },
            ArtificialArea: {
                self.first_year: 47,
                self.last_year: 47,
            },
        }

        self.__check_count(before_expected)

        # FIRST IMPORT

        call_command(
            command_name="load_shapefile",
            land_id="94",
            dataset=DataSource.DatasetChoices.OCSGE,
            millesimes=[2018, 2021],
        )

        self.__check_count(after_expected)

        call_command(
            command_name="load_shapefile",
            land_id="94",
            dataset=DataSource.DatasetChoices.OCSGE,
            millesimes=[2018, 2021],
        )

        self.__check_count(after_expected)
