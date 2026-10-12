from django.conf import settings
from django.http import Http404
from django.views.generic import TemplateView

from utils.views import BreadCrumbMixin


class StatsView(BreadCrumbMixin, TemplateView):
    template_name = "home/stats.html"

    def dispatch(self, request, *args, **kwargs):
        if not settings.STATS_ENABLED:
            raise Http404
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        kwargs["team_email"] = settings.TEAM_EMAIL
        kwargs["STATS_HEIGHT"] = settings.STATS_HEIGHT
        kwargs["STATS_URL"] = settings.STATS_URL
        return super().get_context_data(**kwargs)
