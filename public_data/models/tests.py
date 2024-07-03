from django.core.management import call_command
from django.db.models import F, Sum
from django.test import TestCase

from public_data.models import Cerema, DataSource


class TestCerema(TestCase):
    fixtures = ["public_data/models/data_source_fixture.json"]

    def setUp(self) -> None:
        call_command(
            command_name="load_shapefile",
            dataset=DataSource.DatasetChoices.MAJIC,
        )

    def test_cerema_data(self):
        with self.subTest("Test national mean value for 2011 to 2021"):
            expected_total = 23730.427

            fields = Cerema.get_art_field(
                start=2011,
                end=2021,
            )
            result = Cerema.objects.aggregate(
                national_mean_value_calculated_at_import=Sum("naf11art21") / 10000 / 10,
                national_mean_value_from_rows=Sum(
                    F(fields[0])
                    + F(fields[1])
                    + F(fields[2])
                    + F(fields[3])
                    + F(fields[4])
                    + F(fields[5])
                    + F(fields[6])
                    + F(fields[7])
                    + F(fields[8])
                    + F(fields[9])
                )
                / 10
                / 10000,
            )

            self.assertAlmostEqual(first=result["national_mean_value_from_rows"], second=expected_total, places=3)
            self.assertAlmostEqual(
                first=result["national_mean_value_calculated_at_import"], second=expected_total, places=3
            )
