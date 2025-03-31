from project import charts
from project.models import Project

from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticSynthesisView(DiagnosticBaseView):
    partial_template_name = "project/components/dashboard/synthese.html"
    full_template_name = "project/pages/synthese.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()
        objective_chart = charts.ObjectiveChart(project)
        curent_conso = project.get_bilan_conso_time_scoped()

        kwargs.update(
            {
                "diagnostic": project,
                "objective_chart": objective_chart,
                "current_conso": curent_conso,
                "year_avg_conso": curent_conso / project.nb_years,
            }
        )
        return super().get_context_data(**kwargs)
