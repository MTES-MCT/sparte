from typing import Any, Dict

from django import forms
from django.core.validators import MinValueValidator, MaxValueValidator

from trajectory.models import Trajectory


class SelectYearPeriodForm(forms.Form):
    start = forms.IntegerField(label="Année de début", validators=[MinValueValidator(2000), MaxValueValidator(2075)])
    end = forms.IntegerField(label="Année de fin", validators=[MinValueValidator(2000), MaxValueValidator(2075)])

    def clean(self) -> Dict[str, Any]:
        cleaned_data = super().clean()
        if cleaned_data.get("start") > cleaned_data.get("end"):
            self.add_error("end", "L'année de fin doit être supérieur à l'année de début")
        elif cleaned_data.get("end") == cleaned_data.get("start"):
            self.add_error("end", "Vous devez sélectionner au moins 1 an")
        return cleaned_data


class SetSpaceConsumationForm(forms.Form):

    def __init__(self, trajectory: Trajectory | None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start = start
        self.end = end
        for i in range(self.start, self.end):
            self.fields[f'year_{i}'] = forms.IntegerField(label=f"Consommation {i}", min_value=0, initial=0, required=True)
