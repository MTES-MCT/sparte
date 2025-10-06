from django.views.generic import TemplateView
from django_app_parameter import app_parameter

from utils.views import BreadCrumbMixin


class PrivacyView(BreadCrumbMixin, TemplateView):
    template_name = "home/privacy.html"

    def get_context_data(self, **kwargs):
        kwargs["team_email"] = app_parameter.TEAM_EMAIL
        return super().get_context_data(**kwargs)
