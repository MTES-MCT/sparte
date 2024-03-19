from django.test import TestCase

from public_data.models import Cerema


class TestCerema(TestCase):
    def test_get_art_fields(self):
        self.assertListEqual(
            Cerema.get_art_field(start=2009, end=2021),
            [
                "naf09art10",
                "naf10art11",
                "naf11art12",
                "naf12art13",
                "naf13art14",
                "naf14art15",
                "naf15art16",
                "naf16art17",
                "naf17art18",
                "naf18art19",
                "naf19art20",
                "naf20art21",
                "naf21art22",
            ],
        )

    def test_list_attr(self):
        self.assertListEqual(
            Cerema.list_attr(),
            [
                "naf09art10",
                "naf10art11",
                "naf11art12",
                "naf12art13",
                "naf13art14",
                "naf14art15",
                "naf15art16",
                "naf16art17",
                "naf17art18",
                "naf18art19",
                "naf19art20",
                "naf20art21",
                "naf21art22",
            ],
        )

    def test_too_high_date_raises_error(self):
        with self.assertRaises(ValueError):
            Cerema.get_art_field(start=2009, end=2022)

    def test_too_low_date_raises_error(self):
        with self.assertRaises(ValueError):
            Cerema.get_art_field(start=2008, end=2021)

    def test_end_before_start_raises_error(self):
        with self.assertRaises(ValueError):
            Cerema.get_art_field(start=2021, end=2009)

    def test_same_start_and_end(self):
        self.assertListEqual(Cerema.get_art_field(start=2014, end=2014), ["naf14art15"])
