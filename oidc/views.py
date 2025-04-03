import logging

from django.conf import settings
from django.core.exceptions import SuspiciousOperation
from django.http.response import HttpResponseRedirect
from django.urls import reverse
from django.utils.crypto import get_random_string
from mozilla_django_oidc.views import OIDCLogoutView

logger = logging.getLogger(__name__)


def oidc_login(request):
    return HttpResponseRedirect(
        redirect_to=reverse("oidc_authentication_init") + f"?{request.META.get('QUERY_STRING')}"
    )


def oidc_proconnect_logout(request):
    # récupération du token stocké en session
    if oidc_token := request.session.get("oidc_id_token"):
        # Génére un `state` pour ProConnect
        logout_state = get_random_string(32)
        request.session["logout_state"] = logout_state

        # Construction de l'URL de déconnexion
        logout_url = (
            f"{settings.OIDC_OP_LOGOUT_ENDPOINT}"
            f"?id_token_hint={oidc_token}"
            f"&state={logout_state}"
            f"&post_logout_redirect_uri={request.build_absolute_uri(reverse('oidc_logout'))}"
        )

        # Redirection vers l'URL de déconnexion
        return HttpResponseRedirect(redirect_to=logout_url)

    # Kill session Django et redirection
    return HttpResponseRedirect(redirect_to=reverse("oidc_logout"))


class CustomLogoutView(OIDCLogoutView):
    """
    Vérification du `state` précédemment stocké en session
    """

    def post(self, request):
        if logout_state := request.session.pop("logout_state", None):
            if request.GET.get("state") != logout_state:
                raise SuspiciousOperation("La vérification de la déconnexion a échoué")

        return super().post(request)
