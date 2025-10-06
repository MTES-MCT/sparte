from django.urls import reverse_lazy
from django.views.generic.edit import DeleteView

from users.models import User
from utils.views import BreadCrumbMixin


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
