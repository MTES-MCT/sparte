from django.contrib.auth import logout
from django.views import View
from django.views.generic import DetailView, ListView, RedirectView
from django.views.generic.edit import CreateView, UpdateView, DeleteView, FormView
from django.urls import reverse_lazy

from .models import User
from .forms import SignupForm, SigninForm


class SigninView(FormView):
    template_name = "users/signin.html"
    form_class = SigninForm
    success_url = reverse_lazy("carto:home_connected")


class SignoutView(RedirectView):
    url = reverse_lazy("users:signin")

    def get_redirect_url(self, *args, **kwargs):
        logout(self.request)
        return super().get_redirect_url(*args, **kwargs)


class UserDetailView(DetailView):
    model = User


class UserListView(ListView):
    model = User


class UserCreateView(CreateView):
    model = User
    template_name = "users/signup.html"
    form_class = SignupForm
    success_url = reverse_lazy("users:signin")


class UserUpdateView(UpdateView):
    model = User
    fields = ["email", "first_name", "last_name"]


class UserDeleteView(DeleteView):
    model = User
    success_url = reverse_lazy("home")
