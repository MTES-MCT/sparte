from django.test import TestCase


class HomeTests(TestCase):
    fixtures = ["users/tests/parameters.json"]

    def test_home_status_code(self) -> None:
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    def test_home_page_title(self) -> None:
        response = self.client.get("/")
        self.assertContains(response, "<title>Mon Diagnostic Artificialisation - Analyser et maitriser la consommation d'espaces</title>")

    # maintenance view only redirects to own domain
    def test_maintenance_view_redirects_to_own_domain_when_trying_outside_domain(self) -> None:
        response = self.client.get("/maintenance?next=http://malicious.com")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/")

    def test_maintenance_view_redirects_to_own_domain(self) -> None:
        response = self.client.get("/maintenance?next=/contact")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/contact")
