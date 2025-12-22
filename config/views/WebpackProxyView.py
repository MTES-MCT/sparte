import urllib.error
import urllib.request

from django.http import HttpResponse
from django.views import View


class WebpackProxyView(View):
    """Proxy pour les assets webpack dev server.

    Permet à la fois au navigateur et à Puppeteer d'accéder aux assets
    via Django, évitant les problèmes de résolution de hostname Docker.
    """

    def get(self, request, path: str) -> HttpResponse:
        # En développement, le frontend est accessible via frontend:3000 depuis Docker
        frontend_url = f"http://frontend:3000/{path}"

        try:
            with urllib.request.urlopen(frontend_url, timeout=10) as response:
                content = response.read()
                content_type = response.headers.get("Content-Type", "application/octet-stream")
                return HttpResponse(content, content_type=content_type)
        except urllib.error.URLError as e:
            return HttpResponse(f"Erreur proxy webpack: {e}", status=502)
