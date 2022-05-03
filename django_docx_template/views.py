from django.contrib import messages
from django.http import FileResponse
from django.views.generic import (
    View,
    TemplateView,
    DetailView,
    ListView,
    CreateView,
    DeleteView,
    UpdateView,
)
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse_lazy, reverse


from .forms import TemplateForm
from .models import DocxTemplate
from .utils import import_from_string, get_all_data_sources


class TemplateCreateView(CreateView):
    model = DocxTemplate
    form_class = TemplateForm
    success_url = reverse_lazy("docx_template:list")

    def get_context_data(self, **kwargs):
        kwargs["base_template"] = "django_docx_template/base.html"
        return super().get_context_data(**kwargs)


class TemplateUpdateView(UpdateView):
    model = DocxTemplate
    form_class = TemplateForm

    def get_success_url(self):
        return reverse("docx_template:detail", kwargs={"slug": self.object.slug})

    def get_context_data(self, **kwargs):
        kwargs["base_template"] = "django_docx_template/base.html"
        kwargs["submit_label"] = "Update"
        return super().get_context_data(**kwargs)


class TemplateListView(ListView):
    model = DocxTemplate

    def get_context_data(self, **kwargs):
        kwargs["base_template"] = "django_docx_template/base.html"
        return super().get_context_data(**kwargs)


class TemplateDetailView(DetailView):
    model = DocxTemplate

    def get_context_data(self, **kwargs):
        kwargs["base_template"] = "django_docx_template/base.html"
        kwargs["url_name"] = f"{self.object.slug}-merge"
        base_url = reverse("docx_template:base_url")[1:]  # remove leading /
        kwargs["url_merge"] = f"{base_url}{self.object.get_merge_url()}"
        try:
            examples = self.object.data_source.get_all_example_combinations()
            if examples:
                kwargs["examples"] = [_.values() for _ in examples]
                kwargs["example_headers"] = examples[0].keys()
        except AttributeError:
            pass
        return super().get_context_data(**kwargs)


class TemplateDeletelView(DeleteView):
    model = DocxTemplate

    def get_context_data(self, **kwargs):
        kwargs["base_template"] = "django_docx_template/base.html"
        examples = self.object.data_source.get_all_example_combinations()
        if examples:
            kwargs["examples"] = [_.values() for _ in examples]
            kwargs["example_headers"] = examples[0].keys()
        return super().get_context_data(**kwargs)


class TemplateMergeView(View):
    def merge(self, template, **kwargs):
        return template.merge(**kwargs)

    def get(self, request, *args, **kwargs):
        template = get_object_or_404(DocxTemplate, slug=self.kwargs["slug"])
        buffer = self.merge(template, **kwargs)
        content_type = (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document;"
            "charset=utf-8"
        )
        # TODO use context data to improve filenaming
        filename = template.name.replace(" ", "_")
        filename += ".docx"
        return FileResponse(
            buffer, content_type=content_type, as_attachment=True, filename=filename
        )


class TemplateExampleMergeView(TemplateMergeView):
    def merge(self, template, **kwargs):
        example_number = kwargs.get("example_number", None)
        return template.merge_example(example_number=example_number)


class DataSourceListView(TemplateView):
    template_name = "django_docx_template/datasource_list.html"

    def get_context_data(self, **kwargs):
        kwargs["object_list"] = get_all_data_sources()
        kwargs["base_template"] = "django_docx_template/base.html"
        return super().get_context_data(**kwargs)


class DataSourceDetailView(TemplateView):
    template_name = "django_docx_template/datasource_detail.html"

    def get_context_data(self, **kwargs):
        kwargs["base_template"] = "django_docx_template/base.html"
        kwargs["data_source_class"] = self.kwargs["slug"]
        try:
            kwargs["object"] = import_from_string(kwargs["data_source_class"])
        except KeyError:
            messages.error(self.request, "Unknown data sources")
            return redirect("DataSourceListView")
        return super().get_context_data(**kwargs)
