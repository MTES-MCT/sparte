from datetime import datetime

from django.core.management import call_command
from django.test import TestCase

from public_data.management.commands.import_sudocuh import (
    convert_km2_to_ha,
    empty_string_to_none,
    parse_date,
)
from public_data.models import Sudocuh, SudocuhEpci


class TestImportSudocuh(TestCase):
    def test_import_sudocuh(self) -> None:
        call_command(command_name="import_sudocuh")
        expected_count = 34944
        expected_count_epci = 1537
        self.assertEqual(Sudocuh.objects.count(), expected_count)
        self.assertEqual(SudocuhEpci.objects.count(), expected_count_epci)

    def test_empty_string_are_parsed_as_none(self):
        self.assertIsNone(empty_string_to_none(""))
        self.assertIsNone(empty_string_to_none(" "))

    def test_date_are_parsed_properly(self):
        self.assertEqual(parse_date("01/01/21"), datetime(2021, 1, 1).date())
        self.assertEqual(parse_date("12/31/99"), datetime(1999, 12, 31).date())
        self.assertEqual(parse_date("1/4/99", "%m/%d/%y"), datetime(1999, 1, 4).date())

    def test_convert_superficie_to_ha(self):
        self.assertEqual(convert_km2_to_ha("1"), 100)
