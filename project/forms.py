from django import forms
from django.core.exceptions import ValidationError
from django.db.models import Q

from public_data.models import CommunesSybarval
from public_data.models import Region, Departement, Epci, Commune

from .models import Project, Plan
from .tasks import process_project_with_shape, process_new_plan, build_emprise_from_city


class SetEmpriseForm(forms.Form):
    def save(self, project):
        project.cities.clear()
        project.emprise_origin = Project.EmpriseOrigin.FROM_CITIES
        for city in self.cleaned_data["cities"]:
            project.cities.add(city)
        project.import_status = Project.Status.PENDING
        project.save()
        build_emprise_from_city.delay(project.id)


class SelectCitiesForm(SetEmpriseForm):
    cities = forms.ModelMultipleChoiceField(
        queryset=Commune.objects.all().order_by("name"),
    )


class SelectPluForm(SetEmpriseForm):
    plu = forms.ChoiceField()

    def __init__(self, *args, **kwargs):
        """set choices dynamicaly"""
        super().__init__(*args, **kwargs)
        qs_epci = Epci.objects.all()
        qs_scot = CommunesSybarval.objects.values("_nom_scot").distinct()
        choices_plu = [x.name for x in qs_epci]
        choices_plu += [x["_nom_scot"] for x in qs_scot]
        self.fields["plu"].choices = [(x, x) for x in choices_plu]

    def clean(self):
        """Add cleaned_data["cities"]"""
        super().clean()
        if "plu" in self.cleaned_data:
            name = self.cleaned_data["plu"]
            # 1/ get all the insee code from a SCOT
            qs_insee = CommunesSybarval.objects.filter(_nom_scot=name)
            qs_insee = qs_insee.values_list("code_insee", flat=True).distinct()
            # 2/ find the EPCI selected
            qs_epci = Epci.objects.filter(name=name)
            # 3/ retrieve all Commune from scot and epci
            q_part = Q(insee__in=qs_insee) | Q(epci__in=qs_epci)
            qs = Commune.objects.filter(q_part)
            self.cleaned_data["cities"] = qs
        return self.cleaned_data


class UploadShpForm(forms.Form):
    shape_zip = forms.FileField()

    def save(self, project):
        project.shape_file = self.cleaned_data["shape_zip"]
        project.import_status = Project.Status.PENDING
        project.emprise_origin = Project.EmpriseOrigin.FROM_SHP
        project.save()
        process_project_with_shape.delay(project.id)


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
        label="S??lectionnez une r??gion",
    )

    def __init__(self, *args, **kwargs):
        regions = kwargs.pop("regions", None)
        super().__init__(*args, **kwargs)
        if regions:
            qs = Region.objects.filter(id__in=regions)
            self.fields["region"].queryset = qs
        self.fields["region"].widget.attrs.update(
            {"class": "form-control force-carret"}
        )


class DepartementForm(forms.Form):
    departement = forms.ModelChoiceField(
        queryset=Departement.objects.all().order_by("name"),
        label="S??lectionnez un d??partement",
    )

    def __init__(self, *args, **kwargs):
        self.region_id = None
        if "region_id" in kwargs:
            self.region_id = kwargs.pop("region_id")
        super().__init__(*args, **kwargs)
        if self.region_id:
            qs = Departement.objects.filter(region_id=self.region_id)
            qs = qs.order_by("name")
            self.fields["departement"].queryset = qs
        self.fields["departement"].widget.attrs.update(
            {"class": "form-control force-carret"}
        )


class EpciForm(forms.Form):
    departement = forms.CharField(widget=forms.HiddenInput())
    epci = forms.ModelChoiceField(
        queryset=Epci.objects.none(),
        label="S??lectionnez un EPCI",
    )

    def __init__(self, *args, **kwargs):
        self.departement_id = kwargs.pop("departement_id")
        super().__init__(*args, **kwargs)
        qs = Epci.objects.filter(departements__id=self.departement_id)
        qs = qs.order_by("name")
        self.fields["epci"].queryset = qs
        # dep = Departement.objects.get(pk=self.departement_id)
        self.fields["departement"].initial = self.departement_id
        self.fields["epci"].widget.attrs.update({"class": "form-control force-carret"})


class OptionsForm(forms.Form):
    analysis_start = forms.ChoiceField(
        label="D??but d'analyse", choices=Project.ANALYZE_YEARS
    )
    analysis_end = forms.ChoiceField(
        label="Fin d'analyse", choices=Project.ANALYZE_YEARS
    )
    analysis_level = forms.ChoiceField(
        label="Niveau d'analyse", choices=Project.LEVEL_CHOICES
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["analysis_start"].widget.attrs.update({"class": "force-carret"})
        self.fields["analysis_end"].widget.attrs.update({"class": "force-carret"})
        self.fields["analysis_level"].widget.attrs.update({"class": "force-carret"})

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data["analysis_start"] >= cleaned_data["analysis_end"]:
            raise ValidationError(
                "L'ann??e de d??but d'analyse doit ??tre inf??rieur ?? l'ann??e de fin"
            )


class KeywordForm(forms.Form):
    keyword = forms.CharField(label="Mot cl??")
