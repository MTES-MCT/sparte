import logging

from django.conf import settings
from django.contrib.auth import logout
from django.core.exceptions import SuspiciousOperation
from django.http import HttpRequest
from django.http.response import HttpResponseRedirect
from django.urls import reverse
from django.utils.crypto import get_random_string
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_http_methods
from mozilla_django_oidc.views import OIDCLogoutView

logger = logging.getLogger(__name__)


@require_http_methods(["GET"])
def oidc_login(request: HttpRequest):
    next_url = request.GET.get("next", "/")

    if not url_has_allowed_host_and_scheme(
        url=next_url,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure(),
    ):
        next_url = "/"

    query_string = request.META.get("QUERY_STRING", "")

    if "next=" in query_string:
        query_string = "&".join(param for param in query_string.split("&") if not param.startswith("next="))

    if next_url and query_string:
        query_string = f"next={next_url}&{query_string}"
    elif next_url:
        query_string = f"next={next_url}"
    else:
        query_string = ""

    redirect_url = reverse("oidc_authentication_init") + f"?{query_string}"

    return HttpResponseRedirect(redirect_to=redirect_url)


@require_http_methods(["GET"])
def oidc_proconnect_logout(request):
    # récupération du token stocké en session
    if oidc_token := request.session.get("oidc_id_token"):
        # Génére un `state` pour ProConnect
        logout_state = get_random_string(32)
        request.session["logout_state"] = logout_state

        # Construction de l'URL de redirection
        logout_redirect_uri = request.build_absolute_uri(reverse("oidc:oidc_logout"))

        # Construction de l'URL de déconnexion
        logout_url = (
            f"{settings.OIDC_OP_LOGOUT_ENDPOINT}"
            f"?id_token_hint={oidc_token}"
            f"&state={logout_state}"
            f"&post_logout_redirect_uri={logout_redirect_uri}"
        )

        # Redirection vers l'URL de déconnexion
        return HttpResponseRedirect(redirect_to=logout_url)

    # Redirection vers la page de connexion si pas de connexion via ProConnect
    return HttpResponseRedirect(redirect_to=reverse("users:signin"))


class CustomLogoutView(OIDCLogoutView):
    """
    Vérification du `state` précédemment stocké en session
    """

    def post(self, request):
        if logout_state := request.session.pop("logout_state", None):
            if request.GET.get("state") != logout_state:
                raise SuspiciousOperation("La vérification de la déconnexion a échoué")

        # Déconnexion de l'utilisateur
        logout(request)

        # Redirection vers la page de connexion
        return HttpResponseRedirect(reverse("users:signin"))
