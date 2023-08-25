from django import forms
from django.core.validators import MaxValueValidator, MinValueValidator


def year_choices():
    return [(r, str(r)) for r in range(2000, 2075)]


class DateEndForm(forms.Form):
    end = forms.TypedChoiceField(
        choices=[(r, str(r)) for r in range(2021, 2075)],
        label="Année de fin",
        validators=[MinValueValidator("2021"), MaxValueValidator("2075")],
    )

    def __init__(self, start: int = 2021, end: int = 2030, default: float = 0, *args, **kwargs):
        super().__init__(*args, **kwargs)


class UpdateTrajectoryForm(forms.Form):
    def __init__(self, start: int = 2021, end: int = 2030, default: float = 0, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if isinstance(end, str):
            end = int(end)
        for year in range(start, end + 1):
            key = f"year_{year}"  # year_2023
            updated_key = f"year_updated_{year}"  # year_updated_2023
            self.fields[key] = forms.FloatField(
                label=f"Consommation {year}",
                initial=kwargs["initial"].get(key, default),
                required=True,
            )
            # year_updated_2023
            self.fields[updated_key] = forms.BooleanField(
                label=f"Updated {year}",
                initial=kwargs["initial"].get(updated_key, False),
                required=False,
            )
