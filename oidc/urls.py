from django.urls import path

from . import views

app_name = "oidc"

urlpatterns = [
    path("oidc/login/", views.oidc_login, name="oidc_login"),
    # Déconnexion sur ProConnect
    path("oidc/proconnect_logout/", views.oidc_proconnect_logout, name="oidc_proconnect_logout"),
    # Déconnexion locale
    path("oidc/logout/", views.CustomLogoutView.as_view(), name="oidc_logout"),
]
