from django import forms
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
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
            self.add_error("password2", _("Your passwords must match"))
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data.get("password1"))
        if commit:
            user.save()
        return user


class SigninForm(forms.Form):
    email = forms.EmailField(label=_("email"))
    password = forms.CharField(
        label=_("password"), widget=forms.PasswordInput(), max_length=50
    )

    def clean(self):
        # check user exists
        cleaned_email = self.cleaned_data["email"]
        try:
            self.user = User.objects.get(email=cleaned_email)
        except User.DoesNotExist:
            raise ValidationError(_("No user match this email."))
        # check password is correct
        cleaned_pw = self.cleaned_data["password"]
        user = authenticate(email=cleaned_email, password=cleaned_pw)
        if user is None:
            raise ValidationError(_("Wrong password."))
