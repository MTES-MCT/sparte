from django import forms
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.utils.translation import gettext_lazy as _

from .models import User


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("email",)


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ("email",)


class SignupForm(forms.ModelForm):
    password1 = forms.CharField(
        label=_("password"), widget=forms.PasswordInput(), max_length=50
    )
    password2 = forms.CharField(
        label=_("password confirmation"), widget=forms.PasswordInput(), max_length=50
    )

    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "phone",
            "postal_address",
        )

    def clean_password2(self):
        pass
