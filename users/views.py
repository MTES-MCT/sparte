from django.views.generic import DetailView, ListView
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy

from .models import User
from .forms import SignupForm


class UserDetailView(DetailView):
    model = User


class UserListView(ListView):
    model = User


class UserCreateView(CreateView):
    model = User
    template_name = "users/signup.html"
    form_class = SignupForm
    # fields = ['email', 'password']
    success_url = reverse_lazy("users:login")


class UserUpdateView(UpdateView):
    model = User
    fields = ["email", "first_name", "last_name"]


class UserDeleteView(DeleteView):
    model = User
    success_url = reverse_lazy("home")
