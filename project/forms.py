from typing import Any, Dict

from django import forms
from django.core.validators import MinValueValidator, MaxValueValidator

from project.models import Project
from public_data.models import AdminRef, Departement, Epci, Region


class KeywordForm(forms.Form):
    keyword = forms.CharField(label="Mot clé")


class SelectTerritoryForm(forms.Form):
    keyword = forms.CharField(label="Mot clé")
    selection = forms.CharField(required=False)
    region = forms.ModelChoiceField(
        queryset=Region.objects.all().order_by("name"), required=False
    )
    departement = forms.ModelChoiceField(
        queryset=Departement.objects.all().order_by("name"), required=False
    )
    epci = forms.ModelChoiceField(
        queryset=Epci.objects.all().order_by("name"), required=False
    )
    search_region = forms.BooleanField(required=False, initial=True)
    search_departement = forms.BooleanField(required=False, initial=True)
    search_scot = forms.BooleanField(required=False, initial=True)
    search_epci = forms.BooleanField(required=False, initial=True)
    search_commune = forms.BooleanField(required=False, initial=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields["region"].widget.attrs.update({"class": "adv-item"})
        self.fields["departement"].widget.attrs.update({"class": "adv-item"})
        self.fields["epci"].widget.attrs.update({"class": "adv-item"})

        if "region" in self.data and self.data["region"]:
            try:
                region = Region.objects.get(pk=int(self.data["region"]))
                dept_qs = Departement.objects.filter(region=region).order_by("name")
                self.fields["departement"].queryset = dept_qs
            except Region.DoesNotExist:
                pass
        if "departement" in self.data and self.data["departement"]:
            try:
                dept = Departement.objects.get(pk=int(self.data["departement"]))
                epci_qs = Epci.objects.filter(departements=dept).order_by("name")
                self.fields["epci"].queryset = epci_qs
            except Departement.DoesNotExist:
                pass


class UpdateProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = [
            "name",
            "territory_name",
            "analyse_start_date",
            "analyse_end_date",
            "level",
            "target_2031",
            "is_public",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.land_type:
            choices = AdminRef.get_available_analysis_level(self.instance.land_type)
            self.fields["level"].choices = [(c, AdminRef.get_label(c)) for c in choices]

    def save(self, *args, **kwargs):
        self.instance._change_reason = "update_project"
        return super().save(*args, **kwargs)


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

    def __init__(self, start: int, end: int, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start = start
        self.end = end
        for i in range(self.start, self.end):
            self.fields[f'year_{i}'] = forms.IntegerField(label=f"Consommation {i}", min_value=0, initial=0, required=True)
