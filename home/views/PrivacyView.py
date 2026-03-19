from django.conf import settings
from django.views.generic import TemplateView

from utils.views import BreadCrumbMixin


class PrivacyView(BreadCrumbMixin, TemplateView):
    template_name = "home/privacy.html"

    def get_context_data(self, **kwargs):
        kwargs["team_email"] = settings.TEAM_EMAIL
        return super().get_context_data(**kwargs)
