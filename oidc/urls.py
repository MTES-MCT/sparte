from django.urls import path
from mozilla_django_oidc.views import OIDCAuthenticationRequestView

from . import views

app_name = "oidc"

urlpatterns = [
    # URL d'initialisation de l'authentification
    path("authenticate/", OIDCAuthenticationRequestView.as_view(), name="oidc_authentication_init"),
    # URL de callback après authentification
    path("callback/", views.OIDCCallbackView.as_view(), name="oidc_authentication_callback"),
    # URL de déconnexion
    path("logout/", views.CustomLogoutView.as_view(), name="oidc_logout"),
    # URL de callback après déconnexion
    path("logout-callback/", views.OIDCLogoutCallbackView.as_view(), name="oidc_logout_callback"),
]
