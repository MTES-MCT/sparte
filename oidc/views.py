import logging
import secrets

from django.conf import settings
from django.contrib import messages
from django.core.exceptions import SuspiciousOperation
from django.shortcuts import redirect
from mozilla_django_oidc.views import OIDCCallbackView, OIDCLogoutView

logger = logging.getLogger(__name__)


class CustomLogoutView(OIDCLogoutView):
    """
    Vue personnalisée pour la déconnexion qui gère le processus de déconnexion avec ProConnect
    """

    def get(self, request):
        try:
            # Génération d'un state aléatoire pour la déconnexion
            logout_state = secrets.token_urlsafe(32)
            request.session["logout_state"] = logout_state

            # Construction de l'URL de déconnexion ProConnect
            logout_url = (
                f"{settings.OIDC_OP_LOGOUT_ENDPOINT}"
                f"?id_token_hint={request.session.get('oidc_id_token', '')}"
                f"&state={logout_state}"
                f"&post_logout_redirect_uri={settings.OIDC_LOGOUT_REDIRECT_URI}"
            )

            # Redirection vers ProConnect pour la déconnexion
            return redirect(logout_url)
        except Exception as e:
            logger.error(f"Erreur lors de la déconnexion: {str(e)}")
            messages.error(request, "Une erreur est survenue lors de la déconnexion")
            return redirect(settings.LOGIN_URL)

    def post(self, request):
        try:
            if logout_state := request.session.pop("logout_state", None):
                if request.GET.get("state") != logout_state:
                    raise SuspiciousOperation("La vérification de la déconnexion a échoué")

            return super().post(request)
        except SuspiciousOperation as e:
            logger.error(f"Erreur de vérification de la déconnexion: {str(e)}")
            messages.error(request, "La vérification de la déconnexion a échoué")
            return redirect(settings.LOGIN_URL)


class OIDCLogoutCallbackView(OIDCCallbackView):
    """
    Vue pour gérer le callback après déconnexion de ProConnect
    """

    def get(self, request):
        try:
            state = request.GET.get("state")
            if not state:
                raise SuspiciousOperation("State manquant dans la réponse de déconnexion")

            # Vérification du state stocké en session
            if state != request.session.get("logout_state"):
                raise SuspiciousOperation("State invalide dans la réponse de déconnexion")

            # Nettoyage de la session
            request.session.flush()

            # Redirection vers la page de connexion
            return redirect(settings.LOGIN_URL)
        except SuspiciousOperation as e:
            logger.error(f"Erreur lors du callback de déconnexion: {str(e)}")
            messages.error(request, "Une erreur est survenue lors de la déconnexion")
            return redirect(settings.LOGIN_URL)
