from project.models import Project

from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticLogementVacantView(DiagnosticBaseView):
    partial_template_name = "project/components/dashboard/logement_vacant.html"
    full_template_name = "project/pages/logement_vacant.html"

    def get_context_data(self, **kwargs):
        # Vue simplifiée : React gère maintenant tout le rendu
        # Les charts sont appelés directement via l'API par les composants React
        project: Project = self.get_object()

        kwargs.update(
            {
                "diagnostic": project,
            }
        )

        return super().get_context_data(**kwargs)
