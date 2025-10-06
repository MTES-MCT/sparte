from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy

from users.forms import SigninForm
from utils.views import BreadCrumbMixin


class SigninView(BreadCrumbMixin, LoginView):
    redirect_authenticated_user = True
    template_name = "users/signin.html"
    authentication_form = SigninForm

    def get_context_breadcrumbs(self):
        return [
            {"href": reverse_lazy("home:home"), "title": "Accueil"},
            {"href": reverse_lazy("users:signin"), "title": "Connexion"},
        ]
