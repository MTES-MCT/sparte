from typing import Any, Dict

from django import forms
from django.core.validators import MinValueValidator, MaxValueValidator

from project.models import Project
from trajectory.models import Trajectory


class SelectYearPeriodForm(forms.Form):
    start = forms.IntegerField(
        label="Année de début",
        validators=[MinValueValidator(2000), MaxValueValidator(2075)],
    )
    end = forms.IntegerField(
        label="Année de fin",
        validators=[MinValueValidator(2000), MaxValueValidator(2075)],
    )

    def clean(self) -> Dict[str, Any]:
        cleaned_data = super().clean()
        if cleaned_data.get("start", 2080) > cleaned_data.get("end", 1999):
            self.add_error("end", "L'année de fin doit être supérieur à l'année de début")
        elif cleaned_data.get("end") == cleaned_data.get("start"):
            self.add_error("end", "Vous devez sélectionner au moins 1 an")
        return cleaned_data


class UpdateTrajectoryForm(forms.Form):
    def __init__(self, trajectory: Trajectory, *args, **kwargs):
        self.trajectory = trajectory
        super().__init__(*args, **kwargs)
        for year, val in self.trajectory.get_value_per_year().items():
            self.fields[f"year_{year}"] = forms.IntegerField(
                label=f"Consommation {year}", min_value=0, initial=val, required=True
            )

    def save(self, commit=True):
        for field_name, value in self.cleaned_data.items():
            self.trajectory.data[field_name[5:]] = value
        if commit:
            self.trajectory.save()
        return self.trajectory


class UpdateProjectTrajectoryForm(UpdateTrajectoryForm):
    def __init__(self, project: Project, start: int, end: int, *args, **kwargs):
        self.project = project
        super().__init__(self.get_trajectory(start, end), *args, **kwargs)

    def get_trajectory(self, start: int, end: int):
        trajectory = self.project.trajectory_set.all().first()
        if not trajectory:
            trajectory = self.project.trajectory_set.create(name="Trajectoire 1", start=start, end=end, data={})
        return trajectory
