from django import forms

from .models import DocxTemplate
from .utils import get_all_data_sources


class TemplateForm(forms.ModelForm):
    data_source_class = forms.ChoiceField(widget=forms.Select, choices=[])

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        choices = [(ds.class_path, ds.get_label()) for ds in get_all_data_sources()]
        self.fields["data_source_class"].choices = choices

    class Meta:
        model = DocxTemplate
        fields = [
            "name",
            "docx",
            "data_source_class",
        ]
