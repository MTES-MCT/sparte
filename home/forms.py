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
    alt = "Image représentant le NPS (Net Promoter Score), une mesure de la satisfaction client et de la fidélité à la marque. Elle est souvent utilisée pour évaluer la probabilité que les clients recommandent un produit ou un service à d'autres personnes."  # noqa: E501


class SatisfactionFormSuggestedChange(forms.ModelForm):
    class Meta:
        model = SatisfactionFormEntry
        fields = ("suggested_change",)
        widgets = {"suggested_change": forms.Textarea(attrs={"class": "fr-input", "rows": 3})}

    image = static("home/img/suggested_change.svg")
    alt = "Image représentant une suggestion de changement, souvent utilisée pour recueillir des retours d'expérience et des idées d'amélioration de la part des utilisateurs ou des clients."  # noqa: E501
