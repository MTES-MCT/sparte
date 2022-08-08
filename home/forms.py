from django import forms


class ContactForm(forms.Form):
    email = forms.EmailField(label="Votre e-mail")
    content = forms.CharField(label="Votre message", widget=forms.Textarea)
