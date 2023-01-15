from django import forms
from django.contrib.auth.forms import (
    AuthenticationForm,
    UserChangeForm,
    UserCreationForm,
)

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
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )
    password = forms.CharField(
        label="Mot de passe",
        widget=forms.PasswordInput(attrs={"class": "form-control"}),
        max_length=50,
    )


class UpdatePasswordForm(forms.Form):
    old_password = forms.CharField(
        label="Ancien mot de passe", widget=forms.PasswordInput()
    )
    new_password = forms.CharField(
        label="Nouveau mot de passe", widget=forms.PasswordInput()
    )
    new_password2 = forms.CharField(
        label="Répétez votre nouveau mot de passe", widget=forms.PasswordInput()
    )

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop("user")
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super().clean()
        old_password = cleaned_data.get("old_password")
        new_password = cleaned_data.get("new_password")
        new_password2 = cleaned_data.get("new_password2")
        if not self.user.check_password(old_password):
            self.add_error("old_password", "Ancien mot de passe incorrecte.")
        if new_password is None:
            self.add_error("new_password", "Votre mot de passe ne doit pas être vide.")
        if new_password != new_password2:
            self.add_error("new_password2", "Les mots de passe ne sont pas identiques")
        return cleaned_data

    def save(self):
        passwrd = self.cleaned_data.get("new_password")
        self.user.set_password(passwrd)
        self.user.save()
        return self.user
