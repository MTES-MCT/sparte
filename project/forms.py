from django import forms

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
