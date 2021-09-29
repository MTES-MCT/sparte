from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

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
        label="Mot de passe", widget=forms.PasswordInput(), max_length=50
    )
    password2 = forms.CharField(
        label="Confirmer le mot de passe",
        widget=forms.PasswordInput(),
        max_length=50,
    )

    class Meta:
        model = User
        fields = (
            "organism",
            "function",
            "first_name",
            "last_name",
            "email",
            "password1",
            "password2",
        )

    def clean(self):
        """
        Verify both passwords match.
        """
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")
        if password1 is not None and password1 != password2:
            self.add_error("password2", "Les mots de passe ne sont pas identiques")
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data.get("password1"))
        if commit:
            user.save()
        return user


class SigninForm(AuthenticationForm):
    username = forms.EmailField(
        label="E-mail",
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "placeholder": "ton@email.com",
            }
        ),
    )
    password = forms.CharField(
        label="Mot de passe",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "placeholder": "********",
            },
        ),
        max_length=50,
    )
