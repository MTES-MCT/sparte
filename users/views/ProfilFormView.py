from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic import UpdateView

from users.forms import ProfileForm
from users.models import User
from utils.views import BreadCrumbMixin


class ProfilFormView(BreadCrumbMixin, LoginRequiredMixin, UpdateView):
    template_name = "users/profile.html"
    success_url = reverse_lazy("home:home")
    model = User
    form_class = ProfileForm
    extra_context = {
        "label_validate_btn": "Mettre à jour",
        "show_identity_fields": True,
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
