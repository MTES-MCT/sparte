from project.models import Project

from .DiagnosticBaseView import DiagnosticBaseView


class DiagnostictRapportLocalView(DiagnosticBaseView):
    partial_template_name = "project/components/dashboard/rapport_local.html"
    full_template_name = "project/pages/rapport_local.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()

        kwargs.update(
            {
                "diagnostic": project,
            }
        )
        return super().get_context_data(**kwargs)
