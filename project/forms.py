from django import forms
from django.db.models import Q

from public_data.models import ArtifCommune, CommunesSybarval
from public_data.models import Region, Departement, Epci

from .models import Project, Plan
from .tasks import process_new_project, process_new_plan


class SetEmpriseForm(forms.Form):
    def save(self, project):
        project.cities.clear()
        for city in self.cleaned_data["cities"]:
            project.cities.add(city)
        project.import_status = Project.Status.PENDING
        project.save()
        process_new_project.delay(project.id)


class SelectCitiesForm(SetEmpriseForm):
    cities = forms.ModelMultipleChoiceField(
        queryset=ArtifCommune.objects.all().order_by("name"),
    )


class SelectPluForm(SetEmpriseForm):
    plu = forms.ChoiceField()

    def __init__(self, *args, **kwargs):
        """set choices dynamicaly"""
        super().__init__(*args, **kwargs)
        qs_epci = CommunesSybarval.objects.values("_nom_epci").distinct()
        qs_scot = CommunesSybarval.objects.values("_nom_scot").distinct()
        choices_plu = [x["_nom_epci"] for x in qs_epci]
        choices_plu += [x["_nom_scot"] for x in qs_scot]
        self.fields["plu"].choices = [(x, x) for x in choices_plu]

    def clean(self):
        """Add cleaned_data["cities"]"""
        super().clean()
        if "plu" in self.cleaned_data:
            name = self.cleaned_data["plu"]
            q_part = Q(_nom_epci=name) | Q(_nom_scot=name)
            qs_insee = CommunesSybarval.objects.filter(q_part)
            qs_insee = qs_insee.values_list("code_insee", flat=True).distinct()
            qs = ArtifCommune.objects.filter(insee__in=qs_insee)
            self.cleaned_data["cities"] = qs
        return self.cleaned_data


class UploadShpForm(forms.Form):
    shape_zip = forms.FileField()

    def save(self, project):
        project.shape_file = self.cleaned_data["shape_zip"]
        project.import_status = Project.Status.PENDING
        project.save()
        process_new_project.delay(project.id)


class PlanForm(forms.ModelForm):
    class Meta:
        model = Plan
        fields = [
            "name",
            "description",
            "shape_file",
            "supplier_email",
            "project",
        ]

    def __init__(self, *args, **kwargs):
        """Hide project field if a value is provided"""
        self.project = kwargs.pop("project")
        super().__init__(*args, **kwargs)
        if self.project:
            # we keep it in our form but we force the value later on
            # self.fields["project"].widget = forms.widgets.HiddenInput()
            # self.fields["project"].initial = self.project
            del self.fields["project"]

    def save(self, *args, **kwargs):
        self.instance.import_status = Project.Status.PENDING
        if self.project:
            self.instance.project = self.project
        super().save(*args, **kwargs)
        process_new_plan.delay(self.instance.id)
        return self.instance


class RegionForm(forms.Form):
    region = forms.ModelChoiceField(
        queryset=Region.objects.all().order_by("name"),
        label="Sélectionnez une région",
    )

    def __init__(self, *args, **kwargs):
        regions = kwargs.pop("regions", None)
        super().__init__(*args, **kwargs)
        if regions:
            qs = Region.objects.filter(id__in=regions)
            self.fields["region"].queryset = qs


class DepartementForm(forms.Form):
    departement = forms.ModelChoiceField(
        queryset=Departement.objects.all(),
        label="Sélectionnez un département",
    )

    def __init__(self, *args, **kwargs):
        self.region_id = kwargs.pop("region_id")
        super().__init__(*args, **kwargs)
        qs = Departement.objects.filter(region_id=self.region_id)
        self.fields["departement"].queryset = qs


class EpciForm(forms.Form):
    departement = forms.CharField(widget=forms.HiddenInput())
    epci = forms.ModelChoiceField(
        queryset=Epci.objects.all(),
        label="Sélectionnez un EPCI",
    )

    def __init__(self, *args, **kwargs):
        self.departement_id = kwargs.pop("departement_id")
        super().__init__(*args, **kwargs)
        qs = Epci.objects.filter(departements__id=self.departement_id)
        self.fields["epci"].queryset = qs
        # dep = Departement.objects.get(pk=self.departement_id)
        self.fields["departement"].initial = self.departement_id
