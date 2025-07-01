from django import forms
from django.templatetags.static import static

from .models import Newsletter, SatisfactionFormEntry


class NewsletterForm(forms.ModelForm):
    class Meta:
        model = Newsletter
        fields = ("email",)


class SatisfactionFormNPS(forms.ModelForm):
    class Meta:
        model = SatisfactionFormEntry
        fields = ("nps",)
        widgets = {"nps": forms.NumberInput(attrs={"class": "fr-input"})}

    image = static("home/img/nps.svg")


class SatisfactionFormSuggestedChange(forms.ModelForm):
    class Meta:
        model = SatisfactionFormEntry
        fields = ("suggested_change",)
        widgets = {"suggested_change": forms.Textarea(attrs={"class": "fr-input", "rows": 3})}

    image = static("home/img/suggested_change.svg")
