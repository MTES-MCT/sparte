from datetime import datetime

from django.core.management import call_command
from django.test import TestCase

from public_data.management.commands.import_sudocuh import (
    convert_superficie_to_ha,
    empty_string_to_none,
    parse_date,
)
from public_data.models import Sudocuh


class TestImportSudocuh(TestCase):
    def test_import_sudocuh(self) -> None:
        call_command(command_name="import_sudocuh", yes=True)
        expected_count = 34944
        self.assertEqual(Sudocuh.objects.count(), expected_count)

    def test_calling_the_command_twice_deletes_all_previous_data(self) -> None:
        call_command(command_name="import_sudocuh", yes=True)
        expected_count = 34944
        self.assertEqual(Sudocuh.objects.count(), expected_count)
        call_command(command_name="import_sudocuh", yes=True)
        self.assertEqual(Sudocuh.objects.count(), expected_count)

    def test_empty_string_are_parsed_as_none(self):
        self.assertIsNone(empty_string_to_none(""))
        self.assertIsNone(empty_string_to_none(" "))

    def test_date_are_parsed_properly(self):
        self.assertEqual(parse_date("01/01/21"), datetime(2021, 1, 1).date())
        self.assertEqual(parse_date("12/31/99"), datetime(1999, 12, 31).date())

    def test_convert_superficie_to_ha(self):
        self.assertEqual(convert_superficie_to_ha("1", "km2"), 100)
        self.assertEqual(convert_superficie_to_ha("10000", "m2"), 1)
        self.assertEqual(convert_superficie_to_ha("1", "ha"), 1)
        with self.assertRaises(ValueError):
            convert_superficie_to_ha("1", "unknown")
