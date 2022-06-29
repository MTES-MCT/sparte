from django_docx_template import data_sources

from utils.functions import get_url_with_domain

from . import charts
from .models import Project
from .utils import add_total_line_column


class DiagnosticSource(data_sources.DataSource):
    # properties
    label = "Données pour publier un rapport de diagnostic"
    model = Project
    url_args = {"pk": "int"}

    def get_file_name(self):
        """You can overide this method to set a specific filename to files generated
        with this datasource.If this method raise AttributeError, the name will be set
        with TemplateDocx rules."""
        name = self.project.name.replace(" ", "_")
        return f"{{date:%Y%m%d}}_{name}"

    def get_context_data(self, **keys: dict()) -> dict():
        project = Project.objects.get(pk=keys["pk"])
        self.project = project
        context = {
            "diagnostic": project,
            # deprecated
            "project": project,
        }

        target_2031_consumption = project.get_bilan_conso()
        current_conso = project.get_bilan_conso_time_scoped()

        # Consommation des communes
        chart_conso_cities = charts.ConsoCommuneChart(project, level=project.level)

        # comparison charts
        nb_neighbors = project.nb_look_a_like
        voisins = list()
        if nb_neighbors > 0:
            comparison_chart = charts.ConsoComparisonChart(project, relative=False)
            comparison_relative_chart = charts.ConsoComparisonChart(
                project, relative=True
            )
            voisins = project.get_look_a_like()
            context.update(
                {
                    "voisins": voisins,
                    "comparison_chart": data_sources.Image(
                        comparison_chart.get_temp_image(),
                        width=170,
                    ),
                    "comparison_relative_chart": data_sources.Image(
                        comparison_relative_chart.get_temp_image(),
                        width=170,
                    ),
                    "comparison_data_table": add_total_line_column(
                        comparison_chart.get_series()
                    ),
                }
            )

        # Déterminants
        det_chart = charts.DeterminantPerYearChart(project)
        pie_det_chart = charts.DeterminantPieChart(project)

        # déterminant table, add total line and column
        det_data_table = dict()
        total = dict()
        for name, data in det_chart.get_series().items():
            det_data_table[name] = data.copy()
            det_data_table[name]["total"] = sum(data.values())
            for year, val in data.items():
                total[year] = total.get(year, 0) + val
        total["total"] = sum(total.values())
        det_data_table["Total"] = total

        url_diag = get_url_with_domain(project.get_absolute_url())

        context.update(
            {
                "nb_voisins": nb_neighbors,
                "url_clickable": data_sources.HyperLink(url_diag),
                "url": url_diag,
                "ocsge_is_available": False,
                "communes_data_table": add_total_line_column(
                    chart_conso_cities.get_series()
                ),
                "determinants_data_table": add_total_line_column(
                    det_chart.get_series()
                ),
                "target_2031_consumed": target_2031_consumption,
                "target_2031_annual_avg": target_2031_consumption / 10,
                "target_2031_target": target_2031_consumption / 2,
                "target_2031_annual_forecast": target_2031_consumption / 20,
                "project_scope_consumed": current_conso,
                "project_scope_annual_avg": current_conso / project.nb_years,
                "project_scope_nb_years": project.nb_years,
                "project_scope_nb_years_before_31": project.nb_years_before_2031,
                "project_scope_forecast_2031": project.nb_years_before_2031
                * current_conso
                / project.nb_years,
                # charts
                "chart_conso_communes": data_sources.Image(
                    chart_conso_cities.get_temp_image(),
                    width=170,
                ),
                "chart_determinants": data_sources.Image(
                    det_chart.get_temp_image(),
                    width=170,
                ),
                "pie_chart_determinants": data_sources.Image(
                    pie_det_chart.get_temp_image(),
                    width=170,
                ),
            }
        )
        return context
