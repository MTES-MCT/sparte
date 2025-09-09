from project.models import Project

from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticSynthesisView(DiagnosticBaseView):
    partial_template_name = "project/components/dashboard/synthese.html"
    full_template_name = "project/pages/synthese.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()
        kwargs.update({"diagnostic": project})
        return super().get_context_data(**kwargs)
