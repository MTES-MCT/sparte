from django.http import JsonResponse
from django.views import View

from config.settings import VECTOR_TILES_LOCATION


class EnvironmentView(View):
    def get(self, request) -> JsonResponse:
        return JsonResponse({"vector_tiles_location": VECTOR_TILES_LOCATION})
