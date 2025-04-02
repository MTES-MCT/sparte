import logging

from django.core.exceptions import SuspiciousOperation
from django.shortcuts import redirect
from mozilla_django_oidc.views import OIDCCallbackView, OIDCLogoutView

logger = logging.getLogger(__name__)


class CustomLogoutView(OIDCLogoutView):
    """
    Vue personnalisée pour la déconnexion qui vérifie le state
    """

    def post(self, request):
        if logout_state := request.session.pop("logout_state", None):
            if request.GET.get("state") != logout_state:
                raise SuspiciousOperation("La vérification de la déconnexion a échoué")

        return super().post(request)


class OIDCLogoutCallbackView(OIDCCallbackView):
    """
    Vue pour gérer le callback après déconnexion de ProConnect
    """

    def get(self, request):
        state = request.GET.get("state")
        if not state:
            raise SuspiciousOperation("State manquant dans la réponse de déconnexion")

        # Vérification du state stocké en session
        if state != request.session.get("logout_state"):
            raise SuspiciousOperation("State invalide dans la réponse de déconnexion")

        # Nettoyage de la session
        request.session.flush()

        # Redirection vers la page d'accueil ou de connexion
        return redirect("home")  # À adapter selon votre configuration
