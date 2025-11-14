from django import forms

from project.models import Project
from project.models.enums import ProjectChangeReason
from public_data.models import Departement, Epci, Region


class SelectTerritoryForm(forms.Form):
    keyword = forms.CharField(label="Mot clé")
    selection = forms.CharField(required=False)
    region = forms.ModelChoiceField(queryset=Region.objects.all().order_by("name"), required=False)
    departement = forms.ModelChoiceField(queryset=Departement.objects.all().order_by("name"), required=False)
    epci = forms.ModelChoiceField(queryset=Epci.objects.all().order_by("name"), required=False)
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
            "target_2031",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def save(self, *args, **kwargs):
        self.instance._change_reason = ProjectChangeReason.USER_UPDATED_PROJECT_FROM_PARAMS
        return super().save(*args, **kwargs)


class FilterAUUTable(forms.Form):
    page_number = forms.IntegerField(required=False)
