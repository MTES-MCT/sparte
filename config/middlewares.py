import logging


logger = logging.getLogger(__name__)


class LogIncomingRequest:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        msg = f'"{request.method} {request.get_full_path()}"  incoming'
        logger.info(msg)
        return self.get_response(request)
