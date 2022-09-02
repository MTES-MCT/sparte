from django import forms

from .models import Project
from .tasks import process_project_with_shape


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
