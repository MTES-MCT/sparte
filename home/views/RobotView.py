from django.conf import settings
from django.urls import reverse
from django.views.generic import TemplateView


class RobotView(TemplateView):
    template_name = "home/robots.txt"
    content_type = "text/plain"

    def get_context_data(self, **kwargs):
        kwargs["sitemap_url"] = settings.DOMAIN_URL.rstrip("/") + reverse("sitemap")
        return super().get_context_data(**kwargs)
