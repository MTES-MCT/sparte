from django.contrib.auth.views import LoginView
from django.urls import path

from . import views
from .forms import SigninForm


app_name = "users"

urlpatterns = [
    path("signup/", views.UserCreateView.as_view(), name="signup"),
    path("signout/", views.SignoutView.as_view(), name="signout"),
    path(
        "signin/",
        LoginView.as_view(
            template_name="users/signin.html",
            authentication_form=SigninForm,
        ),
        name="signin",
    ),
]
