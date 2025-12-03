from django.http import JsonResponse
from django.views import View

from config.settings import (
    EXPORT_SERVER_URL,
    MATOMO_CONTAINER_SRC,
    VECTOR_TILES_LOCATION,
)


class EnvironmentView(View):
    def get(self, request) -> JsonResponse:
        base_url = request.build_absolute_uri("/")
        return JsonResponse(
            {
                "vector_tiles_location": VECTOR_TILES_LOCATION,
                "matomo_container_src": MATOMO_CONTAINER_SRC,
                "export_server_url": EXPORT_SERVER_URL,
                "pdf_header_url": f"{base_url}exports/pdf-header",
                "pdf_footer_url": f"{base_url}exports/pdf-footer",
            }
        )
