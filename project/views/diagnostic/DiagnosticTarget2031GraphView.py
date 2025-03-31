from typing import Any, Dict

from django.shortcuts import render

from project import charts

from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticTarget2031GraphView(DiagnosticBaseView):
    template_name = "project/components/charts/report_target_2031_graphic.html"

    def get_context_data(self, **kwargs) -> Dict[str, Any]:
        diagnostic = self.get_object()
        target_2031_chart = charts.ObjectiveChart(diagnostic)
        kwargs.update(
            {
                "diagnostic": diagnostic,
                "target_2031_chart": target_2031_chart,
                "total_2020": target_2031_chart.total_2020,
                "annual_2020": target_2031_chart.annual_2020,
                "conso_2031": target_2031_chart.conso_2031,
                "annual_objective_2031": target_2031_chart.annual_objective_2031,
            }
        )
        return super().get_context_data(**kwargs)

    def get(self, request, *args, **kwargs):
        # Récupération du contexte via la méthode dédiée
        context = self.get_context_data(**kwargs)
        # Rendu du template avec le contexte obtenu
        return render(request, self.template_name, context)
