from django.urls import path

from . import views

app_name = "users"

urlpatterns = [
    path("signup/", views.UserCreateView.as_view(), name="signup"),
    path("signout/", views.SignoutView.as_view(), name="signout"),
    path("signin/", views.SigninView.as_view(), name="signin"),
    path("profile/", views.ProfilFormView.as_view(), name="profile"),
    path("password/", views.UpdatePwFormView.as_view(), name="password"),
    path("unsubscribe/", views.UserDeleteView.as_view(), name="unsubscribe"),
]
