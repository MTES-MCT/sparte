from django import forms
from django.core.exceptions import ValidationError

from public_data.models import Region, Departement, Epci, Commune, AdminRef

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
        label="Sélectionnez une région",
    )

    def __init__(self, *args, **kwargs):
        regions = kwargs.pop("regions", None)
        super().__init__(*args, **kwargs)
        if regions:
            qs = Region.objects.filter(id__in=regions)
            self.fields["region"].queryset = qs
        self.fields["region"].widget.attrs.update({"class": "form-control-with-carret"})


class DepartementForm(forms.Form):
    departement = forms.ModelChoiceField(
        queryset=Departement.objects.all().order_by("name"),
        label="Sélectionnez un département",
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
            {"class": "form-control-with-carret"}
        )


class EpciForm(forms.Form):
    departement = forms.CharField(widget=forms.HiddenInput())
    epci = forms.ModelChoiceField(
        queryset=Epci.objects.none(),
        label="Sélectionnez un EPCI",
    )

    def __init__(self, *args, **kwargs):
        self.departement_id = kwargs.pop("departement_id")
        super().__init__(*args, **kwargs)
        qs = Epci.objects.filter(departements__id=self.departement_id)
        qs = qs.order_by("name")
        self.fields["epci"].queryset = qs
        # dep = Departement.objects.get(pk=self.departement_id)
        self.fields["departement"].initial = self.departement_id
        self.fields["epci"].widget.attrs.update({"class": "form-control-with-carret"})


class OptionsForm(forms.Form):
    public_keys = forms.CharField(
        label="Territoires sélectionnés", widget=forms.HiddenInput()
    )
    analysis_start = forms.ChoiceField(
        label="Début d'analyse", choices=Project.ANALYZE_YEARS, initial="2011"
    )
    analysis_end = forms.ChoiceField(
        label="Fin d'analyse", choices=Project.ANALYZE_YEARS, initial="2019"
    )
    analysis_level = forms.ChoiceField(
        label="Niveau d'analyse",
        choices=Project.LEVEL_CHOICES,
        initial=AdminRef.COMMUNE,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["analysis_start"].widget.attrs.update(
            {"class": "form-control-with-carret-and-block"}
        )
        self.fields["analysis_end"].widget.attrs.update(
            {"class": "form-control-with-carret-and-block"}
        )
        self.fields["analysis_level"].widget.attrs.update(
            {"class": "form-control-with-carret-and-block"}
        )

        type_list = {p.split("_")[0] for p in self.initial["public_keys"].split("-")}
        level = AdminRef.get_admin_level(type_list)
        available_levels = AdminRef.get_available_analysis_level(level)
        self.fields["analysis_level"].widget.choices = [
            (_, AdminRef.CHOICES_DICT[_]) for _ in available_levels
        ]
        self.initial["analysis_level"] = AdminRef.get_analysis_default_level(level)

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data["analysis_start"] >= cleaned_data["analysis_end"]:
            raise ValidationError(
                "L'année de début d'analyse doit être inférieur à l'année de fin"
            )


class KeywordForm(forms.Form):
    keyword = forms.CharField(label="Mot clé")
