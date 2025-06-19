from django import forms

from .models import Newsletter, SatisfactionFormEntry


class NewsletterForm(forms.ModelForm):
    class Meta:
        model = Newsletter
        fields = ("email",)


class SatisfactionForm(forms.ModelForm):
    class Meta:
        model = SatisfactionFormEntry
        fields = ("test",)
