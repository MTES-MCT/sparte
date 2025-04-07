from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView
from django.http import HttpResponseRedirect
from django.urls import reverse, reverse_lazy
from django.views.generic import RedirectView
from django.views.generic.edit import CreateView, DeleteView, FormView, UpdateView

from brevo.tasks import send_user_subscription_to_brevo
from users.forms import SigninForm, SignupForm, UpdatePasswordForm
from users.models import User
from utils.views_mixins import BreadCrumbMixin


class SigninView(BreadCrumbMixin, LoginView):
    redirect_authenticated_user = True
    template_name = "users/signin.html"
    authentication_form = SigninForm

    def get_context_breadcrumbs(self):
        return [
            {"href": reverse_lazy("home:home"), "title": "Accueil"},
            {"href": reverse_lazy("users:signin"), "title": "Connexion"},
        ]


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


class UserCreateView(BreadCrumbMixin, CreateView):
    model = User
    template_name = "users/signup.html"
    form_class = SignupForm
    success_url = reverse_lazy("users:signin")

    def form_valid(self, form):
        self.object = form.save()
        send_user_subscription_to_brevo.delay(self.object.id)
        login(self.request, self.object, backend="django.contrib.auth.backends.ModelBackend")
        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        return self.request.GET.get("next", None) or super().get_success_url()

    def get_context_breadcrumbs(self):
        return [
            {"href": reverse_lazy("home:home"), "title": "Accueil"},
            {"href": reverse_lazy("users:signup"), "title": "Inscription"},
        ]

    def get_context_data(self, **kwargs):
        kwargs["next"] = self.request.GET.get("next", None)
        return super().get_context_data(**kwargs)


class UserDeleteView(BreadCrumbMixin, DeleteView):
    template_name = "users/form.html"
    extra_context = {
        "label_validate_btn": "Confirmer",
        "page_title": "Désinscription",
        "title": "Désinscription",
    }
    model = User
    success_url = reverse_lazy("home:home")

    def get_context_breadcrumbs(self):
        return [
            {"href": reverse_lazy("home:home"), "title": "Accueil"},
            {"href": reverse_lazy("users:profile"), "title": "Profil"},
            {"href": reverse_lazy("users:unsubscribe"), "title": "Désinscription"},
        ]

    def get_object(self, queryset=None):
        """Return connected user."""
        return self.request.user


class ProfilFormView(BreadCrumbMixin, LoginRequiredMixin, UpdateView):
    template_name = "users/profile.html"
    success_url = reverse_lazy("users:profile")
    model = User
    fields = ["first_name", "last_name", "organism", "function"]
    extra_context = {
        "label_validate_btn": "Mettre à jour",
        "page_title": "Profil",
        "title": "Votre profil",
    }

    def get_context_breadcrumbs(self):
        return [
            {"href": reverse_lazy("home:home"), "title": "Accueil"},
            {"href": reverse_lazy("users:profile"), "title": "Profil"},
        ]

    def get_object(self, queryset=None):
        return self.request.user

    def form_valid(self, form):
        messages.success(self.request, "Votre profil a été mis à jour avec succès.")
        return super().form_valid(form)


class UpdatePwFormView(BreadCrumbMixin, LoginRequiredMixin, FormView):
    template_name = "users/form.html"
    form_class = UpdatePasswordForm
    success_url = reverse_lazy("users:profile")
    extra_context = {
        "label_validate_btn": "Changer",
        "page_title": "Changer de mot de passe",
        "title": "Changer de mot de passe",
    }

    def get_context_breadcrumbs(self):
        return [
            {"href": reverse_lazy("home:home"), "title": "Accueil"},
            {"href": reverse_lazy("users:profile"), "title": "Profil"},
            {"href": reverse_lazy("users:password"), "title": "Modifier mot de passe"},
        ]

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs.update({"user": self.request.user})
        return kwargs

    def form_valid(self, form):
        messages.success(self.request, "Votre mot de passe a été changé.")
        form.save()
        return super().form_valid(form)
