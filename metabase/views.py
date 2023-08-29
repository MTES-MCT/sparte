from typing import Any, Dict

from django.views.generic import TemplateView
from django_app_parameter import app_parameter


class StatsView(TemplateView):
    template_name = "metabase/stats.html"

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        kwargs |= {
            "STATS_HEIGHT": app_parameter.STATS_HEIGHT,
            "STATS_URL": app_parameter.STATS_URL,
        }
        return super().get_context_data(**kwargs)
