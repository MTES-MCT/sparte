from django import forms


class DisplayOcsgeForm(forms.Form):
    millesime = forms.ChoiceField(choices=[("2015", "2015"), ("2018", "2018")])
    color = forms.ChoiceField(
        choices=[("usage", "Usage des sols"), ("couverture", "Couverture des sols")]
    )
