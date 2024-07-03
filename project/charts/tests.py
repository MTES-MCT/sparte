import requests
from django.test import TestCase

from .constants import PAGE_INDICATEUR_URL


class TestCharts(TestCase):
    def test_page_indicateur_is_accessible(self):
        response = requests.get(PAGE_INDICATEUR_URL)
        self.assertEqual(response.status_code, 200)
