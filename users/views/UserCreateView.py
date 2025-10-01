from django.contrib.auth import login
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.generic.edit import CreateView

from users.forms import SignupForm
from users.models import User
from utils.views import BreadCrumbMixin, RedirectURLMixin


class UserCreateView(BreadCrumbMixin, CreateView, RedirectURLMixin):
    model = User
    template_name = "users/signup.html"
    form_class = SignupForm
    success_url = reverse_lazy("users:signin")

    def get_success_url(self):
        next_url = self.request.GET.get("next", "")
        if not url_has_allowed_host_and_scheme(
            url=next_url,
            allowed_hosts={self.request.get_host()},
            require_https=self.request.is_secure(),
        ):
            return super().get_success_url()
        return next_url

    def form_valid(self, form):
        self.object = form.save()
        login(self.request, self.object, backend="django.contrib.auth.backends.ModelBackend")
        return HttpResponseRedirect(self.get_success_url())

    def get_context_breadcrumbs(self):
        return [
            {"href": reverse_lazy("home:home"), "title": "Accueil"},
            {"href": reverse_lazy("users:signup"), "title": "Inscription"},
        ]

    def get_context_data(self, **kwargs):
        kwargs["next"] = self.request.GET.get("next", "")

        if not url_has_allowed_host_and_scheme(
            url=kwargs["next"],
            allowed_hosts={self.request.get_host()},
            require_https=self.request.is_secure(),
        ):
            kwargs["next"] = "/"

        return super().get_context_data(**kwargs)
