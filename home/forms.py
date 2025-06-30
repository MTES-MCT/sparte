from django import forms

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


class SatisfactionFormSuggestedChange(forms.ModelForm):
    class Meta:
        model = SatisfactionFormEntry
        fields = ("suggested_change",)
        widgets = {"suggested_change": forms.Textarea(attrs={"class": "fr-input", "rows": 3})}
