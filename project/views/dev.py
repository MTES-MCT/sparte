from uuid import uuid4

from project import charts

from .diagnostic import DiagnosticBaseView


class AllChartsForPreview(DiagnosticBaseView):
    template_name = "project/dev/all_charts_for_preview.html"
    breadcrumbs_title = "Rapport consommation"

    def get_context_data(self, **kwargs):
        project = self.get_object()

        all_charts = []

        for chart in map(charts.__dict__.get, charts.__all__):
            try:
                chart = chart(project, level=project.level)
            except Exception:
                try:
                    chart = chart(project)
                except Exception:
                    continue
            uuid = str(uuid4()).replace("-", "_")
            chart.id = "id_" + uuid
            chart.name = "chart_" + uuid
            chart.classname = chart.__class__.__name__
            chart.json_data = chart.dumps(indent=4, mark_output_safe=False)
            all_charts.append(chart)

        return super().get_context_data(all_charts=all_charts, **kwargs)
