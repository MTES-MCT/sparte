from unittest import TestCase

from public_data.models.administration.LandModel import is_insee_code


class IsInseeCodeTest(TestCase):
    def test_codes_numeriques(self):
        for needle in ["69", "69123", "75056", "200046977"]:
            self.assertTrue(is_insee_code(needle), needle)

    def test_codes_corses(self):
        for needle in ["2A", "2B", "2A004", "2B033", "2a004", "2b", "2A0"]:
            self.assertTrue(is_insee_code(needle), needle)

    def test_noms(self):
        for needle in ["Lyon", "Ajaccio", "2C004", "A2004", "2A004a", "Paris 2", ""]:
            self.assertFalse(is_insee_code(needle), needle)
