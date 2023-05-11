import logging
import time

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
