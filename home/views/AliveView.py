from datetime import timedelta
from typing import Any

from django.http import HttpRequest, HttpResponse, HttpResponseGone
from django.utils import timezone
from django.views.generic import TemplateView

from home.models import AliveTimeStamp


class AliveView(TemplateView):
    template_name = "home/alive.html"

    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        from_datetime = timezone.now() - timedelta(minutes=35)
        default_is_alive = AliveTimeStamp.objects.filter(queue_name="default", timestamp__gte=from_datetime).exists()
        long_is_alive = AliveTimeStamp.objects.filter(queue_name="default", timestamp__gte=from_datetime).exists()
        if default_is_alive and long_is_alive:
            return HttpResponse("All good...")
        return HttpResponseGone("Celery workers are not alive.")
