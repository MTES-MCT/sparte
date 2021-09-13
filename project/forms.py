from django import forms
from django.db.models import Q

from public_data.models import ArtifCommune, CommunesSybarval

from .models import Project
from .tasks import import_shp


class SetEmpriseForm(forms.Form):
    def save(self, project):
        project.cities.clear()
        for city in self.cleaned_data["cities"]:
            project.cities.add(city)
        project.import_status = Project.Status.SUCCESS
        project.save()


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
        import_shp.delay(project.id)
