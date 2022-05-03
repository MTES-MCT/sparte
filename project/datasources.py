from django_docx_template import data_sources

from utils.functions import get_url_with_domain

from .charts import ConsoCommuneChart, DeterminantPerYearChart, DeterminantPieChart
from .models import Project


class DiagnosticSource(data_sources.DataSource):
    # properties
    label = "Données pour publier un rapport de diagnostic"
    model = Project
    url_args = {"pk": "int"}

    def get_context_data(self, **keys: dict()) -> dict():
        project = Project.objects.get(pk=keys["pk"])

        target_2031_consumption = project.get_bilan_conso()
        current_conso = project.get_bilan_conso_time_scoped()

        # Consommation des communes
        chart_conso_cities = ConsoCommuneChart(project)
        communes_table = dict()
        for city_name, data in chart_conso_cities.get_series().items():
            data.update({"Total": sum(data.values())})
            communes_table[city_name] = data

        # Déterminants
        det_chart = DeterminantPerYearChart(project)
        pie_det_chart = DeterminantPieChart(project)

        url_diag = get_url_with_domain(project.get_absolute_url())

        context = {
            "diagnostic": project,
            "url_clickable": data_sources.HyperLink(url_diag),
            "url": url_diag,
            "ocsge_is_available": False,
            "communes_data_table": communes_table,  # tableau de conso des communes
            "determinants_data_table": det_chart.get_series(),
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
            # deprecated
            "project": project,
        }

        return context
