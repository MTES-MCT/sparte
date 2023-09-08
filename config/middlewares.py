import logging
import time

from django.http import HttpResponseRedirect
from django.urls import reverse
from django_app_parameter import app_parameter


logger = logging.getLogger(__name__)


class LogIncomingRequest:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.monotonic()
        msg = f'"{request.method} {request.get_full_path()}"  incoming'
        logger.info(msg)
        response = self.get_response(request)
        duration = time.monotonic() - start_time
        seconds = int(duration)
        milliseconds = int((duration - seconds) * 1000)
        microseconds = int((duration - seconds - milliseconds / 1000) * 1000000)
        logger.info(f"Request took {seconds}s {milliseconds}ms {microseconds}µs to process")
        return response


class MaintenanceModeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        maintenance_path = reverse("home:maintenance_mode")

        # Évitez une redirection infinie en autorisant l'accès à la vue de maintenance et à l'admin
        if (
            app_parameter.MAINTENANCE_MODE
            and not request.path.startswith("/admin/")
            and request.path != maintenance_path
        ):
            return HttpResponseRedirect(f"{maintenance_path}?next={request.path}")

        return self.get_response(request)
