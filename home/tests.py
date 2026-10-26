import re

from csp.utils import build_policy
from django.conf import settings
from django.test import TestCase, modify_settings, override_settings

from config.csp import WEBPACK_DEV_SERVER, WEBPACK_DEV_SERVER_WS, build_csp_directives


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


CSP_MIDDLEWARE = "config.middlewares.ForceNonceCSPMiddleware"
HTTPS_SOURCES = {
    "media_url": "https://sparte.s3.fr-par.scw.cloud/media/",
    "airflow_s3_base_url": "https://sparte.s3.fr-par.scw.cloud",
    "s3_endpoint_url": "https://s3.fr-par.scw.cloud",
}


class ContentSecurityPolicyTests(TestCase):
    """L'en-tête Content-Security-Policy est émis au format django-csp 4 (politique dans config/csp.py)."""

    def setUp(self) -> None:
        if CSP_MIDDLEWARE not in settings.MIDDLEWARE:  # USE_CSP=0 dans l'environnement de test
            override = modify_settings(MIDDLEWARE={"prepend": CSP_MIDDLEWARE})
            override.enable()
            self.addCleanup(override.disable)

    def test_home_page_sends_header_with_matching_nonce(self) -> None:
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.has_header("Content-Security-Policy"))
        policy = response["Content-Security-Policy"]
        self.assertIn("default-src 'self'", policy)
        self.assertIn("frame-ancestors 'self'", policy)
        self.assertIn("form-action 'self'", policy)
        match = re.search(r"script-src [^;]*'nonce-([^']+)'", policy)
        self.assertIsNotNone(match)
        content = response.content.decode()
        self.assertIn(match.group(1), content)
        self.assertNotIn("[NONCE_PLACEHOLDER]", content)

    def test_report_only_mode_does_not_enforce_the_policy(self) -> None:
        policy = {"DIRECTIVES": build_csp_directives(local=False, **HTTPS_SOURCES)}
        with override_settings(CONTENT_SECURITY_POLICY=None, CONTENT_SECURITY_POLICY_REPORT_ONLY=policy):
            response = self.client.get("/")

        self.assertFalse(response.has_header("Content-Security-Policy"))
        self.assertIn("default-src 'self'", response["Content-Security-Policy-Report-Only"])

    def test_production_policy_only_allows_https_sources(self) -> None:
        directives = build_csp_directives(local=False, **HTTPS_SOURCES)

        self.assertIs(directives["upgrade-insecure-requests"], True)
        sources = [
            source
            for value in directives.values()
            if isinstance(value, list)
            for source in value
            if isinstance(source, str)
        ]
        self.assertEqual([source for source in sources if source.startswith(("http:", "ws:"))], [])
        policy = build_policy(config=directives)
        self.assertIn("upgrade-insecure-requests", policy)
        self.assertNotIn("http:", policy)
        self.assertNotIn("ws:", policy)

    def test_local_policy_tolerates_webpack_dev_server_and_local_s3(self) -> None:
        directives = build_csp_directives(local=True, **{**HTTPS_SOURCES, "s3_endpoint_url": "http://s3:7070"})

        self.assertNotIn("upgrade-insecure-requests", directives)
        for directive in ("script-src", "style-src", "img-src", "font-src", "connect-src"):
            self.assertIn(WEBPACK_DEV_SERVER, directives[directive])
        self.assertIn(WEBPACK_DEV_SERVER_WS, directives["connect-src"])
        self.assertIn("http://s3:7070", directives["img-src"])
        self.assertIn("http://s3:7070", directives["connect-src"])
