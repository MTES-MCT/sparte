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


class SatisfactionFormSuggestedChange(forms.ModelForm):
    class Meta:
        model = SatisfactionFormEntry
        fields = ("suggested_change",)
