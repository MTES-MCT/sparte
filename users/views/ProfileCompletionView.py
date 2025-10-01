from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.generic import UpdateView

from users.forms import ProfileCompletionForm
from users.models import User


class ProfileCompletionView(LoginRequiredMixin, UpdateView):
    model = User
    form_class = ProfileCompletionForm
    template_name = "users/profile_completion.html"
    success_url = reverse_lazy("home:home")
    extra_context = {
        "label_validate_btn": "Finaliser mon inscription",
        "show_identity_fields": False,
    }

    def get_object(self):
        return self.request.user

    def get_success_url(self):
        next_url = self.request.GET.get("next", "")

        if not url_has_allowed_host_and_scheme(
            url=next_url,
            allowed_hosts={self.request.get_host()},
            require_https=self.request.is_secure(),
        ):
            return super().get_success_url()

        return next_url
