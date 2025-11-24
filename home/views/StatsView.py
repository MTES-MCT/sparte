from django.views.generic import TemplateView
from django_app_parameter import app_parameter

from utils.views import BreadCrumbMixin


class StatsView(BreadCrumbMixin, TemplateView):
    template_name = "home/stats.html"

    def get_context_data(self, **kwargs):
        kwargs["team_email"] = app_parameter.TEAM_EMAIL
        kwargs["STATS_HEIGHT"] = app_parameter.STATS_HEIGHT
        kwargs["STATS_URL"] = app_parameter.STATS_URL
        return super().get_context_data(**kwargs)
