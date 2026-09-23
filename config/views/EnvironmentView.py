from django.http import JsonResponse
from django.views import View

from config.environment import get_environment


class EnvironmentView(View):
    def get(self, request) -> JsonResponse:
        return JsonResponse(get_environment())
