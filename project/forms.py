from django import forms

from public_data.models import Region, Departement, Epci
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
    search_region = forms.BooleanField(required=False)
    search_departement = forms.BooleanField(required=False)
    search_epci = forms.BooleanField(required=False)
    search_commune = forms.BooleanField(required=False)

    def clean_data(self, data):
        dept = epci = None
        if "region" in data and data["region"]:
            dept = data.get("departement", None)
            if dept:
                epci = data.get("epci", None)
        return {
            "keyword": data.get("keyword", None),
            "selection": data.get("selection", None),
            "region": data.get("region", None),
            "departement": dept,
            "epci": epci,
            "search_region": data.get("search_region", None),
            "search_departement": data.get("search_departement", None),
            "search_epci": data.get("search_epci", None),
            "search_commune": data.get("search_commune", None),
        }

    def __init__(self, *args, **kwargs):
        kwargs["data"] = self.clean_data(kwargs.get("data", dict()))

        super().__init__(*args, **kwargs)

        self.fields["region"].widget.attrs.update({"class": "adv-item"})
        self.fields["departement"].widget.attrs.update({"class": "adv-item"})
        self.fields["epci"].widget.attrs.update({"class": "adv-item"})

        if self.data["region"]:
            try:
                region = Region.objects.get(pk=int(self.data["region"]))
                dept_qs = Departement.objects.filter(region=region).order_by("name")
                self.fields["departement"].queryset = dept_qs
            except Region.DoesNotExist:
                pass
        if self.data["departement"]:
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
