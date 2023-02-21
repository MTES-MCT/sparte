from django import forms

from public_data.models import Region, Departement, Epci, AdminRef
from project.models import Project
from project.tasks import process_project_with_shape


class UploadShpForm(forms.Form):
    shape_zip = forms.FileField()

    def save(self, project):
        project.shape_file = self.cleaned_data["shape_zip"]
        project.import_status = Project.Status.PENDING
        project.emprise_origin = Project.EmpriseOrigin.FROM_SHP
        project.save()
        process_project_with_shape.delay(project.id)


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


class EpciForm(forms.Form):
    departement = forms.CharField(widget=forms.HiddenInput())

    def __init__(self, *args, **kwargs):
        self.departement_id = kwargs.pop("departement_id")
        super().__init__(*args, **kwargs)
        qs = Epci.objects.filter(departements__id=self.departement_id)
        qs = qs.order_by("name")
        self.fields["epci"].queryset = qs
        # dep = Departement.objects.get(pk=self.departement_id)
        self.fields["departement"].initial = self.departement_id
        self.fields["epci"].widget.attrs.update({"class": "form-control-with-carret"})


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
