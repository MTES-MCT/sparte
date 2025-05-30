from django.conf import settings
from django.contrib.auth.views import (
    PasswordResetCompleteView,
    PasswordResetConfirmView,
    PasswordResetDoneView,
    PasswordResetView,
)
from django.urls import path, reverse_lazy

from . import views

app_name = "users"


urlpatterns = [
    path("signup/", views.UserCreateView.as_view(), name="signup"),
    path("signout/", views.SignoutView.as_view(), name="signout"),
    path("signin/", views.SigninView.as_view(), name="signin"),
    path("profile/", views.ProfilFormView.as_view(), name="profile"),
    path("password/", views.UpdatePwFormView.as_view(), name="password"),
    path(
        "password-reset/",
        PasswordResetView.as_view(
            email_template_name="users/password_reset_email.txt",
            html_email_template_name="users/password_reset_email.html",
            success_url=reverse_lazy("users:password_reset_done"),
            extra_email_context={"DOMAIN_URL": settings.DOMAIN_URL.strip("/")},
            template_name="users/password_reset.html",
        ),
        name="password_reset",
    ),
    path(
        "password-reset/done/",
        PasswordResetDoneView.as_view(
            template_name="users/password_reset_done.html",
        ),
        name="password_reset_done",
    ),
    path(
        "password-reset-confirm/<uidb64>/<token>/",
        PasswordResetConfirmView.as_view(
            template_name="users/password_reset_confirm.html",
            success_url=reverse_lazy("users:password_reset_complete"),
        ),
        name="password_reset_confirm",
    ),
    path(
        "password-reset-complete/",
        PasswordResetCompleteView.as_view(template_name="users/password_reset_complete.html"),
        name="password_reset_complete",
    ),
    path("unsubscribe/", views.UserDeleteView.as_view(), name="unsubscribe"),
    path(
        "complete-profile/",
        views.ProfileCompletionView.as_view(),
        name="complete_profile",
    ),
]
