"""
Plan du site (sitemap.xml) : pages statiques et pages de diagnostic de chaque
territoire.

Les URL absolues sont construites à partir de ``settings.DOMAIN_URL`` et non de
l'hôte de la requête : en production le TLS est terminé par le proxy Scalingo et
Django verrait sinon du ``http://`` ou un alias de domaine.
"""

from types import SimpleNamespace
from urllib.parse import urlparse

from django.conf import settings
from django.contrib.sitemaps import Sitemap
from django.urls import reverse

from public_data.models import AdminRef
from public_data.models.administration import LandModel

SITEMAP_CACHE_TIMEOUT = 60 * 60 * 24 * 30  # 30 jours


def canonical_site():
    """Domaine et protocole canoniques, tirés de DOMAIN_URL."""
    parsed = urlparse(settings.DOMAIN_URL)
    return SimpleNamespace(domain=parsed.netloc, name=parsed.netloc), parsed.scheme or "https"


class CanonicalDomainSitemap(Sitemap):
    def get_urls(self, page=1, site=None, protocol=None):
        site, protocol = canonical_site()
        return super().get_urls(page=page, site=site, protocol=protocol)


class StaticViewSitemap(CanonicalDomainSitemap):
    changefreq = "monthly"
    priority = 0.5

    def items(self):
        return [
            "home:home",
            "home:home_rapport_local",
            "home:stats",
            "home:contact",
            "home:accessibilite",
            "home:cgv",
            "home:privacy",
        ]

    def location(self, item):
        return reverse(item)


# Pages publiques d'un diagnostic : (nom de route, suffixe de section, priorité).
# Exclues : « téléchargements » (dépend de l'utilisateur) et « résidences secondaires ».
LAND_PAGES = [
    ("project:home", "", 0.8),
    ("project:report_conso", "consommation", 0.6),
    ("project:report_artif", "artificialisation", 0.6),
    ("project:report_imper", "impermeabilisation", 0.6),
    ("project:report_logement_vacant", "vacance-des-logements", 0.6),
    ("project:report_friches", "friches", 0.6),
    ("project:report_target_2031", "trajectoires", 0.6),
    ("project:report_local", "rapport-local", 0.6),
]


class LandSitemap(CanonicalDomainSitemap):
    """Une page de diagnostic pour chaque territoire d'un type donné."""

    changefreq = "monthly"

    def __init__(self, land_type: str, url_name: str = "project:home", priority: float = 0.8):
        self.land_type = land_type
        self.url_name = url_name
        self.priority = priority

    def items(self):
        return (
            LandModel.objects.filter(land_type=self.land_type, is_diagnosticable=True)
            .only("key", "land_type_slug", "slug")
            .order_by("land_id")
        )

    def location(self, land):
        return reverse(self.url_name, args=[land.land_type_slug, land.slug])


def build_land_sitemaps() -> dict:
    """Une section par type de territoire et par page : « commune », « commune-consommation », …"""
    result = {}
    for land_slug, land_type in AdminRef.SLUG_TO_CODE.items():
        for url_name, suffix, priority in LAND_PAGES:
            section = f"{land_slug}-{suffix}" if suffix else land_slug
            result[section] = LandSitemap(land_type, url_name, priority)
    return result


sitemaps = {"pages": StaticViewSitemap(), **build_land_sitemaps()}
