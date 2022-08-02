import os
import tempfile

from django_docx_template import data_sources

from utils.functions import get_url_with_domain

from . import charts
from .models import Project
from .utils import add_total_line_column


class SolInterface:
    def __init__(self, item):
        self.item = item

    @property
    def code(self):
        spacer = " ".join(["-"] * self.item.level)
        return f"{spacer} {self.item.code}"

    @property
    def label(self):
        return self.item.get_label_short()

    @property
    def surface_first(self):
        return str(round(self.item.surface_first, 1))

    @property
    def surface_last(self):
        return str(round(self.item.surface_last, 1))

    @property
    def surface_diff(self):
        val = round(self.item.surface_diff, 2)
        if self.item.surface_diff > 0:
            return f"+{val}"
        elif self.item.surface_diff == 0:
            return "-"
        else:
            return str(val)


class DiagnosticSource(data_sources.DataSource):
    # properties
    label = "Données pour publier un rapport de diagnostic"
    model = Project
    url_args = {"pk": "int"}

    def get_file_name(self):
        """You can overide this method to set a specific filename to files generated
        with this datasource.If this method raise AttributeError, the name will be set
        with TemplateDocx rules."""
        return (
            f"{self.project.name} - {self.project.analyse_start_date} à "
            f"{self.project.analyse_end_date} - issu de SPARTE.docx"
        )

    def get_context_data(self, **keys: dict()) -> dict():
        project = Project.objects.get(pk=keys["pk"])
        self.project = project
        context = {
            "diagnostic": project,
            "nom_territoire": project.get_territory_name(),
            "ocsge_is_available": False,
            "periode_differente_zan": (
                project.analyse_start_date != "2011"
                or project.analyse_end_date != "2020"
            ),
            # deprecated
            "project": project,
        }

        if project.cover_image:
            fd, img_path = tempfile.mkstemp(suffix=".png", text=False)
            os.write(fd, project.cover_image.open().read())
            os.close(fd)
            context.update({"photo_emprise": data_sources.Image(img_path, height=110)})

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

        # projection ZAN 2031
        objective_chart = charts.ObjectiveChart(project)

        url_diag = get_url_with_domain(project.get_absolute_url())

        context.update(
            {
                "nb_voisins": nb_neighbors,
                "url_clickable": data_sources.HyperLink(url_diag),
                "url": url_diag,
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
                    width=140,
                ),
                "projection_zan_2031": data_sources.Image(
                    objective_chart.get_temp_image(),
                    width=170,
                ),
                "projection_zan_cumulee_ref": round(objective_chart.total_real, 1),
                "projection_zan_annuelle_ref": round(objective_chart.previsionnal, 1),
                "projection_zan_cumulee_objectif": round(objective_chart.conso_2031),
                "projection_zan_annuelle_objectif": round(
                    objective_chart.annual_objective_2031
                ),
            }
        )

        if project.is_artif:
            donut_usage = charts.UsageSolPieChart(project)
            graphique_usage = charts.UsageSolProgressionChart(project)
            usage_data = [SolInterface(i) for i in graphique_usage.get_series()]

            donut_couverture = charts.CouvertureSolPieChart(project)
            graphique_couverture = charts.CouvertureSolProgressionChart(project)
            couverture_data = [
                SolInterface(i) for i in graphique_couverture.get_series()
            ]

            context.update(
                {
                    "ocsge_is_available": True,
                    "debut_ocsge": str(project.first_year_ocsge),
                    "fin_ocsge": str(project.last_year_ocsge),
                    "donut_usage": data_sources.Image(
                        donut_usage.get_temp_image(),
                        width=140,
                    ),
                    "graphique_usage": data_sources.Image(
                        graphique_usage.get_temp_image(),
                        width=170,
                    ),
                    "usage_data": usage_data,
                    "donut_couverture": data_sources.Image(
                        donut_couverture.get_temp_image(),
                        width=140,
                    ),
                    "graphique_couverture": data_sources.Image(
                        graphique_couverture.get_temp_image(),
                        width=170,
                    ),
                    "couverture_data": couverture_data,
                }
            )
        return context
