from django.conf import settings
from django.template import Context, Template
from django.template.loader import get_template
from django.test import SimpleTestCase, TestCase


class HomeTests(TestCase):
    def test_home_status_code(self) -> None:
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    # maintenance view only redirects to own domain
    def test_maintenance_view_redirects_to_own_domain_when_trying_outside_domain(self) -> None:
        response = self.client.get("/maintenance?next=http://malicious.com")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/")

    def test_maintenance_view_redirects_to_own_domain(self) -> None:
        response = self.client.get("/maintenance?next=/contact")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/contact")


class SitemapTests(TestCase):
    """Le plan du site est construit sur DOMAIN_URL, pas sur l'hôte de la requête."""

    DOMAIN_URL = "https://mondiagartif.beta.gouv.fr/"

    def _land(self, land_type="COMM", land_id="01079", slug="01079-champagne-en-valromey", land_type_slug="commune"):
        from public_data.models.administration import LandModel

        return LandModel(
            key=f"{land_type}_{land_id}",
            land_type=land_type,
            land_id=land_id,
            slug=slug,
            land_type_slug=land_type_slug,
        )

    def test_index_lists_every_section_with_canonical_domain(self) -> None:
        from unittest.mock import patch

        with self.settings(DOMAIN_URL=self.DOMAIN_URL, ALLOWED_HOSTS=["*"]), patch(
            "config.sitemaps.LandSitemap.items", return_value=[]
        ):
            response = self.client.get("/sitemap.xml", HTTP_HOST="sparte.osc-fr1.scalingo.io")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/xml")
        content = response.content.decode()
        for section in ["pages", "commune", "epci", "departement", "scot", "region", "nation"]:
            self.assertIn(f"<loc>https://mondiagartif.beta.gouv.fr/sitemap-{section}.xml</loc>", content)
        for section in ["commune-consommation", "epci-friches", "region-rapport-local", "nation-trajectoires"]:
            self.assertIn(f"<loc>https://mondiagartif.beta.gouv.fr/sitemap-{section}.xml</loc>", content)
        self.assertNotIn("telechargements", content)
        self.assertNotIn("residences-secondaires", content)
        # 1 section statique + 6 types de territoire x 8 pages
        self.assertEqual(content.count("<sitemap>"), 1 + 6 * 8)
        self.assertNotIn("scalingo.io", content)
        self.assertNotIn("<loc>http://", content)

    def test_static_pages_section(self) -> None:
        with self.settings(DOMAIN_URL=self.DOMAIN_URL, ALLOWED_HOSTS=["*"]):
            response = self.client.get("/sitemap-pages.xml", HTTP_HOST="sparte.osc-fr1.scalingo.io")

        self.assertEqual(response.status_code, 200)
        content = response.content.decode()
        self.assertIn("<loc>https://mondiagartif.beta.gouv.fr/</loc>", content)
        self.assertIn("<loc>https://mondiagartif.beta.gouv.fr/rapport-local</loc>", content)
        self.assertIn("<loc>https://mondiagartif.beta.gouv.fr/accessibilite</loc>", content)
        self.assertNotIn("scalingo.io", content)

    def test_land_section_links_diagnostic_pages(self) -> None:
        from unittest.mock import patch

        lands = [self._land(), self._land(land_id="75056", slug="75056-paris")]
        with self.settings(DOMAIN_URL=self.DOMAIN_URL, ALLOWED_HOSTS=["*"]), patch(
            "config.sitemaps.LandSitemap.items", return_value=lands
        ):
            response = self.client.get("/sitemap-commune.xml")

        self.assertEqual(response.status_code, 200)
        content = response.content.decode()
        self.assertIn(
            "<loc>https://mondiagartif.beta.gouv.fr/diagnostic/commune/01079-champagne-en-valromey/</loc>", content
        )
        self.assertIn("<loc>https://mondiagartif.beta.gouv.fr/diagnostic/commune/75056-paris/</loc>", content)
        self.assertEqual(content.count("<url>"), 2)

    def test_land_sub_page_section(self) -> None:
        from unittest.mock import patch

        with self.settings(DOMAIN_URL=self.DOMAIN_URL), patch(
            "config.sitemaps.LandSitemap.items", return_value=[self._land()]
        ):
            response = self.client.get("/sitemap-commune-consommation.xml")

        self.assertEqual(response.status_code, 200)
        content = response.content.decode()
        self.assertIn(
            "<loc>https://mondiagartif.beta.gouv.fr/diagnostic/commune/01079-champagne-en-valromey/consommation</loc>",
            content,
        )
        self.assertIn("<priority>0.6</priority>", content)

    def test_land_section_uses_http_when_domain_url_is_http(self) -> None:
        from unittest.mock import patch

        with self.settings(DOMAIN_URL="http://localhost:8080/"), patch(
            "config.sitemaps.LandSitemap.items", return_value=[self._land()]
        ):
            response = self.client.get("/sitemap-commune.xml")

        self.assertIn(
            "<loc>http://localhost:8080/diagnostic/commune/01079-champagne-en-valromey/</loc>",
            response.content.decode(),
        )

    def test_unknown_section_is_404(self) -> None:
        response = self.client.get("/sitemap-inconnu.xml")
        self.assertEqual(response.status_code, 404)

    def test_land_sitemap_excludes_non_diagnosticable_lands(self) -> None:
        from config.sitemaps import LandSitemap

        queryset = LandSitemap("COMM").items()
        self.assertIn("is_diagnosticable", str(queryset.query))

    def test_robots_txt_points_to_sitemap(self) -> None:
        with self.settings(DOMAIN_URL=self.DOMAIN_URL, ALLOWED_HOSTS=["*"]):
            response = self.client.get("/robots.txt", HTTP_HOST="sparte.osc-fr1.scalingo.io")

        self.assertEqual(response.status_code, 200)
        self.assertIn("Sitemap: https://mondiagartif.beta.gouv.fr/sitemap.xml", response.content.decode())


class SriStaticTemplateTagTests(SimpleTestCase):
    """
    Les templates s'appuient sur le tag `sri_static` de django-sri, retiré dans la version 1.0 :
    on vérifie qu'ils compilent et que le tag produit bien un lien vers nos fichiers statiques.
    """

    TEMPLATES_USING_SRI = [
        "home/home.html",
        "home/home_rapport_local.html",
        "home/accessibilite.html",
        "home/download.html",
        "home/legal_notices.html",
        "home/privacy.html",
        "project/layout/base.html",
    ]

    def test_templates_using_sri_compile(self) -> None:
        for template_name in self.TEMPLATES_USING_SRI:
            with self.subTest(template=template_name):
                get_template(template_name)

    def test_sri_static_renders_a_stylesheet_link_to_our_static_file(self) -> None:
        html = Template('{% load sri %}{% sri_static "home/css/home.css" %}').render(Context())

        self.assertTrue(html.startswith("<link"), html)
        self.assertIn('rel="stylesheet"', html)
        self.assertIn('href="/static/home/css/home.css"', html)
        if settings.USE_SRI:
            self.assertIn('crossorigin="anonymous"', html)
            self.assertRegex(html, r'integrity="sha(256|384|512)-[A-Za-z0-9+/=]+"')
