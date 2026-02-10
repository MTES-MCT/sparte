from django.http import JsonResponse
from django.views import View

from project.charts.constants import CARROYAGE_DESTINATION_CONFIG


class CarroyageDestinationConfigView(View):
    def get(self, request) -> JsonResponse:
        return JsonResponse(CARROYAGE_DESTINATION_CONFIG)
