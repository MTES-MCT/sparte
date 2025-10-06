from django.contrib.auth import logout
from django.urls import reverse, reverse_lazy
from django.views.generic import RedirectView


class SignoutView(RedirectView):
    url = reverse_lazy("users:signin")

    def get_redirect_url(self, *args, **kwargs):
        # Vérifier si l'utilisateur a un token OIDC dans la session
        if "oidc_id_token" in self.request.session:
            # Si oui, rediriger vers la déconnexion OIDC
            return reverse("oidc:oidc_proconnect_logout")

        # Déconnexion classique Django
        logout(self.request)

        # Si l'utilisateur n'est pas authentifié via OIDC, rediriger vers la page de connexion classique
        return super().get_redirect_url(*args, **kwargs)
