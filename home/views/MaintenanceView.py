from typing import Any

from django.shortcuts import redirect
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.generic import TemplateView
from django_app_parameter import app_parameter

from utils.htmx import HtmxRedirectMixin, StandAloneMixin


class MaintenanceView(StandAloneMixin, HtmxRedirectMixin, TemplateView):
    template_name = "home/partials/maintenance.html"

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        kwargs["next"] = self.get_redirect_url()
        return super().get_context_data(**kwargs)

    def get_redirect_url(self):
        next_url = self.request.GET.get("next", "/")

        if not url_has_allowed_host_and_scheme(
            url=next_url,
            allowed_hosts={self.request.get_host()},
            require_https=self.request.is_secure(),
        ):
            next_url = "/"

        return next_url

    def get(self, request, *args, **kwargs):
        if not app_parameter.MAINTENANCE_MODE:
            return redirect(self.get_redirect_url())
        return super().get(request, *args, **kwargs)
