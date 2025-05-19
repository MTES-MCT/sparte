from project import charts

from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticTarget2031View(DiagnosticBaseView):
    partial_template_name = "project/components/dashboard/trajectoires.html"
    full_template_name = "project/pages/trajectoires.html"

    def get_context_data(self, **kwargs):
        diagnostic = self.get_object()
        target_2031_chart = charts.ObjectiveChart(diagnostic)
        kwargs.update(
            {
                "diagnostic": diagnostic,
                "total_real": target_2031_chart.total_real,
                "annual_real": target_2031_chart.annual_real,
                "conso_2031": target_2031_chart.conso_2031,
                "annual_objective_2031": target_2031_chart.annual_objective_2031,
                "target_2031_chart": target_2031_chart,
                "target_2031_chart_data": target_2031_chart.dict(),
            }
        )
        return super().get_context_data(**kwargs)
