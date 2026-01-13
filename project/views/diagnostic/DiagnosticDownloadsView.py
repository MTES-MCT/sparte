from project.models import Project

from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticDownloadsView(DiagnosticBaseView):
    template_name = "project/pages/downloads.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()

        kwargs.update(
            {
                "diagnostic": project,
            }
        )
        return super().get_context_data(**kwargs)
