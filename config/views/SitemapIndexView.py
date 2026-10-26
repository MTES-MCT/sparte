from django.contrib.sitemaps.views import x_robots_tag
from django.template.response import TemplateResponse
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views import View

from config.sitemaps import canonical_site, sitemaps


@method_decorator(x_robots_tag, name="dispatch")
class SitemapIndexView(View):
    """
    Index des sitemaps (sitemap.xml).

    Reprend ``django.contrib.sitemaps.views.index`` mais construit les URL
    absolues avec le domaine canonique (DOMAIN_URL) plutôt qu'avec l'hôte et
    le protocole de la requête.
    """

    def get(self, request):
        site, protocol = canonical_site()
        entries = []
        for section, sitemap in sitemaps.items():
            path = reverse("sitemap-section", kwargs={"section": section})
            absolute_url = f"{protocol}://{site.domain}{path}"
            entries.append({"location": absolute_url, "last_mod": None})
            for page in range(2, sitemap.paginator.num_pages + 1):
                entries.append({"location": f"{absolute_url}?p={page}", "last_mod": None})
        return TemplateResponse(request, "sitemap_index.xml", {"sitemaps": entries}, content_type="application/xml")
