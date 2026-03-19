import time

from django import forms
from django.core.signing import BadSignature, Signer
from rest_framework import serializers


def generate_token() -> str:
    return Signer().sign(str(int(time.time())))


def validate_token(token: str) -> bool:
    try:
        ts = int(Signer().unsign(token))
        elapsed = time.time() - ts
        return 3 <= elapsed <= 3600
    except (BadSignature, ValueError):
        return False


class AntispamFormMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["website"] = forms.CharField(
            required=False,
            label="Ne pas remplir",
            widget=forms.TextInput(attrs={"autocomplete": "off", "tabindex": "-1", "class": "fr-hidden"}),
        )
        self.fields["_token"] = forms.CharField(widget=forms.HiddenInput(), initial=generate_token())

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get("website") or not validate_token(cleaned_data.get("_token", "")):
            raise forms.ValidationError("Erreur de validation")
        return cleaned_data


class AntispamSerializerMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["_token"] = serializers.CharField(write_only=True)

    def validate(self, data):
        data = super().validate(data)
        if not validate_token(data.pop("_token", "")):
            raise serializers.ValidationError("Erreur de validation")
        return data
