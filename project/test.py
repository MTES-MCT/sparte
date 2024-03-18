from unittest import TestCase

from .utils import add_total_line_column


class TestAddTotalLineColumn(TestCase):
    def test_add_total_line_column(self):
        series = {
            "A": {"2018": 1, "2019": 2, "2020": 3},
            "B": {"2018": 4, "2019": 5, "2020": 6},
        }
        expected = {
            "A": {"2018": 1, "2019": 2, "2020": 3, "total": 6},
            "B": {"2018": 4, "2019": 5, "2020": 6, "total": 15},
            "Total": {"2018": 5, "2019": 7, "2020": 9, "total": 21},
        }
        self.assertDictEqual(add_total_line_column(series), expected)

    def test_add_total_line_column_with_none(self):
        series = {
            "A": {"2018": 1, "2019": 2, "2020": None},
            "B": {"2018": 4, "2019": 5, "2020": 6},
        }
        expected = {
            "A": {"2018": 1, "2019": 2, "2020": 0, "total": 3},
            "B": {"2018": 4, "2019": 5, "2020": 6, "total": 15},
            "Total": {"2018": 5, "2019": 7, "2020": 6, "total": 18},
        }
        self.assertDictEqual(add_total_line_column(series, replace_none=True), expected)

    def test_add_total_line_column_with_missing_data(self):
        series = {
            "A": {"2018": 1, "2019": 2},
            "B": {"2018": 4, "2019": 5, "2020": 6},
        }
        expected = {
            "A": {"2018": 1, "2019": 2, "total": 3},
            "B": {"2018": 4, "2019": 5, "2020": 6, "total": 15},
            "Total": {"2018": 5, "2019": 7, "2020": 6, "total": 18},
        }
        self.assertDictEqual(add_total_line_column(series, replace_none=True), expected)

    def test_add_total_line_column_without_column(self):
        series = {
            "A": {"2018": 1, "2019": 2, "2020": 3},
            "B": {"2018": 4, "2019": 5, "2020": 6},
        }
        expected = {
            "A": {"2018": 1, "2019": 2, "2020": 3},
            "B": {"2018": 4, "2019": 5, "2020": 6},
            "Total": {"2018": 5, "2019": 7, "2020": 9},
        }
        self.assertDictEqual(add_total_line_column(series, column=False), expected)

    def test_add_total_line_column_without_line(self):
        series = {
            "A": {"2018": 1, "2019": 2, "2020": 3},
            "B": {"2018": 4, "2019": 5, "2020": 6},
        }
        expected = {
            "A": {"2018": 1, "2019": 2, "2020": 3, "total": 6},
            "B": {"2018": 4, "2019": 5, "2020": 6, "total": 15},
        }
        self.assertDictEqual(add_total_line_column(series, line=False), expected)

    def test_add_total_line_column_without_line_and_column(self):
        series = {
            "A": {"2018": 1, "2019": 2, "2020": 3},
            "B": {"2018": 4, "2019": 5, "2020": 6},
        }
        self.assertDictEqual(add_total_line_column(series, line=False, column=False), series)

    def test_add_total_line_column_empty(self):
        series = {}
        expected = {"Total": {"total": 0}}
        self.assertDictEqual(add_total_line_column(series), expected)
