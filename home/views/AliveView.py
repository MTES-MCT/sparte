from typing import Any

from django.http import HttpRequest, HttpResponse
from django.views.generic import TemplateView


class AliveView(TemplateView):
    template_name = "home/alive.html"

    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        return HttpResponse("All good...")
