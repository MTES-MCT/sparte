from django.urls import path

from . import views


app_name = "users"

urlpatterns = [
    path("signup/", views.UserCreateView.as_view(), name="signup"),
    path("signout/", views.SignoutView.as_view(), name="signout"),
    path("signin/", views.SigninView.as_view(), name="signin"),
]
