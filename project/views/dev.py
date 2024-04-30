from uuid import uuid4

from project import charts

from .report import ProjectReportBaseView


class AllChartsForPreview(ProjectReportBaseView):
    template_name = "project/all_charts_for_preview.html"
    breadcrumbs_title = "Rapport consommation"

    def get_context_data(self, **kwargs):
        project = self.get_object()

        all_charts = []

        for chart in map(charts.__dict__.get, charts.__all__):
            try:
                chart = chart(project)
            except Exception:
                chart = chart(project, level=project.level)
            uuid = str(uuid4()).replace("-", "_")
            chart.id = "id_" + uuid
            chart.name = "chart_" + uuid
            chart.classname = chart.__class__.__name__
            all_charts.append(chart)

        return super().get_context_data(all_charts=all_charts, **kwargs)
