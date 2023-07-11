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
                label=f"Consommation {year}", min_value=0, initial=val if val else 0, required=True
            )
        self.fields["end"].initial = self.trajectory.end

    def save(self, commit=True):
        self.trajectory.end = self.cleaned_data["end"]
        self.trajectory.data = {
            year: self.cleaned_data.get(f"year_{year}", 0)
            for year in range(2021, int(self.cleaned_data["end"]) + 1)
        }
        if commit:
            self.trajectory.save()
        return self.trajectory
