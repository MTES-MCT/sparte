from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView
from django.views.generic import RedirectView
from django.views.generic.edit import CreateView, UpdateView, DeleteView, FormView
from django.urls import reverse_lazy

from utils.views_mixins import BreadCrumbMixin

from .models import User
from .forms import SignupForm, SigninForm, UpdatePasswordForm


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
        logout(self.request)
        return super().get_redirect_url(*args, **kwargs)


class UserCreateView(BreadCrumbMixin, CreateView):
    model = User
    template_name = "users/signup.html"
    form_class = SignupForm
    success_url = reverse_lazy("users:signin")

    def get_context_breadcrumbs(self):
        return [
            {"href": reverse_lazy("home:home"), "title": "Accueil"},
            {"href": reverse_lazy("users:signup"), "title": "Inscription"},
        ]


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
