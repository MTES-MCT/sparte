from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic.edit import FormView

from users.forms import UpdatePasswordForm
from utils.views import BreadCrumbMixin


class UpdatePwFormView(BreadCrumbMixin, LoginRequiredMixin, FormView):
    template_name = "users/form.html"
    form_class = UpdatePasswordForm
    success_url = reverse_lazy("users:profile")
    extra_context = {
        "label_validate_btn": "Modifier",
        "page_title": "Modifier mon mot de passe",
        "title": "Modifier mon mot de passe",
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
