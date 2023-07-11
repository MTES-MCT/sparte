from typing import Any, Dict

from django import forms
from django.core.validators import MaxValueValidator, MinValueValidator

from trajectory.models import Trajectory


def year_choices():
    return [(r, str(r)) for r in range(2000, 2075)]


class SelectYearPeriodForm(forms.Form):
    start = forms.TypedChoiceField(
        choices=year_choices(),
        label="",
        validators=[MinValueValidator("2000"), MaxValueValidator("2075")],
    )
    end = forms.TypedChoiceField(
        choices=[(r, str(r)) for r in range(2021, 2075)],
        label="Année de fin",
        validators=[MinValueValidator("2021"), MaxValueValidator("2075")],
    )

    def __init__(self, trajectory: Trajectory, *args, **kwargs):
        self.trajectory = trajectory
        super().__init__(*args, **kwargs)
        for year, val in self.trajectory.get_value_per_year().items():
            self.fields[f"year_{year}"] = forms.IntegerField(
                label=f"Consommation {year}", min_value=0, initial=val, required=True
            )

    def clean(self) -> Dict[str, Any]:
        cleaned_data = super().clean()
        # check that there is one field per year in the period
        for y in range(self.trajectory.start, self.cleaned_data["end"] + 1):
            if f"year_{y}" not in cleaned_data:
                self.add_error(f"year_{y}", "Ce champ doit être renseigné")
        return cleaned_data

    def save(self, commit=True):
        self.trajectory.end = self.cleaned_data["end"]
        for field_name, value in self.cleaned_data.items():
            if field_name.startswith("year_"):
                self.trajectory.data[field_name[5:]] = value
        if commit:
            self.trajectory.save()
        return self.trajectory
