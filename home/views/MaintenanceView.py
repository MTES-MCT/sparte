from typing import Any

from django.conf import settings
from django.shortcuts import redirect
from django.views.generic import TemplateView
from django_app_parameter import app_parameter

from utils.functions import get_url_with_domain
from utils.htmx import HtmxRedirectMixin, StandAloneMixin


class MaintenanceView(StandAloneMixin, HtmxRedirectMixin, TemplateView):
    template_name = "home/partials/maintenance.html"

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        kwargs["next"] = self.request.GET.get("next", "/")
        return super().get_context_data(**kwargs)

    def get_redirect_url(self):
        return get_url_with_domain(self.request.GET.get("next", "/"))

    def get(self, request, *args, **kwargs):
        if not app_parameter.MAINTENANCE_MODE:
            if request.META.get("HTTP_HX_REQUEST"):
                return self.htmx_redirect()
            else:
                url = settings.DOMAIN_URL.strip("/") + self.request.GET.get("next", "/")
                return redirect(url)
        return super().get(request, *args, **kwargs)
