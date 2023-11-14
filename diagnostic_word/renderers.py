import os
import tempfile
from io import BytesIO
from typing import Any, Dict, Optional, Union

from django.db.models import ImageField
from docx.shared import Mm
from docxtpl import DocxTemplate, InlineImage, RichText

from diagnostic_word.models import WordTemplate
from project import charts
from project.models import Project
from project.utils import add_total_line_column
from utils.functions import get_url_with_domain


def save_to_local_temp_image(field: ImageField) -> str:
    """Save an image to a temporary file and return its path."""
    fd, img_path = tempfile.mkstemp(suffix=".png", text=False)
    os.write(fd, field.open().read())
    os.close(fd)
    return img_path


class SolInterface:
    surface_territory = None

    def __init__(self, item):
        self.item = item

    @property
    def code(self):
        if self.item.level == 1:
            spacer = ""
        else:
            spacer = "".join(["-"] * (self.item.level - 1))
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

    @property
    def percent(self):
        val = 100 * float(self.item.surface_last) / self.surface_territory
        return f"{round(val)}%"


class ReprDetailArtif:
    total_artif = None
    total_renat = None

    def __init__(self, item):
        self.label = f"{item['code_prefix'] } {item['label_short']}"
        self.artif = str(round(item["artif"], 1))
        self.renat = str(round(item["renat"], 1))
        if self.total_artif > 0:
            self.artif_percent = str(round(100 * item["artif"] / self.total_artif))
        else:
            self.artif_percent = "N/A"
        if self.total_renat > 0:
            self.renat_percent = str(round(100 * item["renat"] / self.total_renat))
        else:
            self.renat_percent = "N/A"


class Renderer:
    def __init__(self, project: Project, word_template_slug: str):
        self.project = project
        self.word_template = WordTemplate.objects.get(slug=word_template_slug)
        self.context_opened = False
        self.engine = DocxTemplate(self.word_template.docx)

    def __enter__(self) -> "Renderer":
        self.context_opened = True
        return self

    def __exit__(self, exc_type, exc_value, exc_tb) -> None:
        self.context_opened = False

    def render_to_docx(self, context: Dict[str, Any]) -> BytesIO:
        """Load actual docx file and merge all fields. Return the final doc as BytesIO."""
        self.engine.render(context)
        buffer = BytesIO()
        self.engine.save(buffer)
        buffer.seek(0)
        return buffer

    def prep_chart(self, chart):
        return self.prep_image(chart.get_temp_image(), width=170)

    def prep_image(
        self,
        field: Union[ImageField, str],
        width: Optional[int] = None,
        height: Optional[int] = None,
    ) -> InlineImage:
        """Prepare an image to be inserted in the docx file."""
        if isinstance(field, ImageField):
            img_path = save_to_local_temp_image(field)
        else:
            img_path = field
        return InlineImage(
            self.engine,
            img_path,
            width=Mm(width) if width else None,
            height=Mm(height) if height else None,
        )

    def prep_link(self, link: str, text: Optional[str] = None) -> RichText:
        if not text:
            text = link
        rt = RichText()
        rt.add(text, url_id=self.engine.build_url_id(link))
        return rt

    def get_context_data(self) -> Dict[str, Any]:
        diagnostic = self.project
        surface_territory = diagnostic.area
        context = {
            "diagnostic": diagnostic,
            "nom_territoire": diagnostic.get_territory_name(),
            "surface_totale": str(round(surface_territory, 2)),
            "ocsge_is_available": False,
            "periode_differente_zan": (
                diagnostic.analyse_start_date != "2011" or diagnostic.analyse_end_date != "2020"
            ),
            "project": diagnostic,
            "photo_emprise": self.prep_image(diagnostic.cover_image, height=110),
            "nb_communes": diagnostic.cities.count(),
            "carte_consommation": self.prep_image(diagnostic.theme_map_conso, width=170),
            "carte_artificialisation": self.prep_image(diagnostic.theme_map_artif, width=170),
            "carte_comprendre_artificialisation": self.prep_image(diagnostic.theme_map_understand_artif, width=170),
        }

        target_2031_consumption = diagnostic.get_bilan_conso()
        current_conso = diagnostic.get_bilan_conso_time_scoped()

        # Consommation des communes
        chart_conso_cities = charts.ConsoCommuneChart(diagnostic, level=diagnostic.level)

        # comparison charts
        nb_neighbors = diagnostic.nb_look_a_like
        voisins = list()
        if nb_neighbors > 0:
            comparison_chart = charts.ConsoChart(diagnostic)
            comparison_relative_chart = charts.ConsoComparisonChart(diagnostic)
            voisins = diagnostic.get_look_a_like()
            context.update(
                {
                    "voisins": voisins,
                    "comparison_chart": self.prep_image(
                        comparison_chart.get_temp_image(),
                        width=170,
                    ),
                    "comparison_relative_chart": self.prep_image(
                        comparison_relative_chart.get_temp_image(),
                        width=170,
                    ),
                    "comparison_data_table": add_total_line_column(comparison_chart.get_series()),
                }
            )

        # Déterminants
        det_chart = charts.DeterminantPerYearChart(diagnostic)
        pie_det_chart = charts.DeterminantPieChart(diagnostic)

        # déterminant table, add total line and column
        det_data_table: Dict = {}
        total: Dict = {}
        for name, data in det_chart.get_series().items():
            det_data_table[name] = data.copy()
            det_data_table[name]["total"] = sum(data.values())
            for year, val in data.items():
                total[year] = total.get(year, 0) + val
        total["total"] = sum(total.values())
        det_data_table["Total"] = total

        # projection ZAN 2031
        objective_chart = charts.ObjectiveChart(diagnostic)

        url_diag = get_url_with_domain(diagnostic.get_absolute_url())

        context |= {
            "nb_voisins": nb_neighbors,
            "url_clickable": self.prep_link(link=url_diag),
            "url": url_diag,
            "communes_data_table": add_total_line_column(chart_conso_cities.get_series()),
            "determinants_data_table": add_total_line_column(det_chart.get_series()),
            "target_2031_consumed": target_2031_consumption,
            "target_2031_annual_avg": target_2031_consumption / 10,
            "target_2031_target": target_2031_consumption / 2,
            "target_2031_annual_forecast": target_2031_consumption / 20,
            "project_scope_consumed": current_conso,
            "project_scope_annual_avg": current_conso / diagnostic.nb_years,
            "project_scope_nb_years": diagnostic.nb_years,
            "project_scope_nb_years_before_31": diagnostic.nb_years_before_2031,
            "project_scope_forecast_2031": diagnostic.nb_years_before_2031 * current_conso / diagnostic.nb_years,
            # charts
            "chart_conso_communes": self.prep_chart(chart_conso_cities),
            "chart_determinants": self.prep_chart(det_chart),
            "pie_chart_determinants": self.prep_chart(pie_det_chart),
            "projection_zan_2031": self.prep_chart(objective_chart),
            "projection_zan_cumulee_ref": round(objective_chart.total_real, 1),
            "projection_zan_annuelle_ref": round(objective_chart.annual_real, 1),
            "projection_zan_cumulee_objectif": round(objective_chart.conso_2031),
            "projection_zan_annuelle_objectif": round(objective_chart.annual_objective_2031),
        }

        surface_chart = charts.SurfaceChart(diagnostic)
        pop_chart = charts.PopChart(diagnostic)
        conso_comparison_pop_chart = charts.ConsoComparisonPopChart(diagnostic)
        household_chart = charts.HouseholdChart(diagnostic)
        conso_comparison_household_chart = charts.ConsoComparisonHouseholdChart(diagnostic)

        context |= {
            "surface_chart": self.prep_chart(surface_chart),
            "pop_chart": self.prep_chart(pop_chart),
            "pop_table": add_total_line_column(pop_chart.get_series(), replace_none=True),
            "conso_comparison_pop_chart": self.prep_chart(conso_comparison_pop_chart),
            "conso_comparison_pop_table": add_total_line_column(
                conso_comparison_pop_chart.get_series(), replace_none=True
            ),
            "household_chart": self.prep_chart(household_chart),
            "household_table": add_total_line_column(household_chart.get_series(), replace_none=True),
            "conso_comparison_household_chart": self.prep_chart(conso_comparison_household_chart),
            "conso_comparison_household_table": add_total_line_column(
                conso_comparison_household_chart.get_series(), replace_none=True
            ),
        }

        if diagnostic.uniformly_covered_by_ocsge:
            context.update(
                {
                    "ocsge_is_available": True,
                    "debut_ocsge": str(diagnostic.first_year_ocsge),
                    "fin_ocsge": str(diagnostic.last_year_ocsge),
                    "usage_matrix_data": dict(),
                    "usage_matrix_headers": dict(),
                    "couverture_matrix_data": dict(),
                    "couverture_matrix_headers": dict(),
                }
            )

            SolInterface.surface_territory = surface_territory
            donut_usage = charts.UsageSolPieChart(diagnostic)
            graphique_usage = charts.UsageSolProgressionChart(diagnostic)
            usage_data = [SolInterface(i) for i in graphique_usage.get_series()]

            context.update(
                {
                    "donut_usage": self.prep_image(
                        donut_usage.get_temp_image(),
                        width=140,
                    ),
                    "graphique_usage": self.prep_image(
                        graphique_usage.get_temp_image(),
                        width=170,
                    ),
                    "usage_data": usage_data,
                }
            )

            usage_matrix_data = diagnostic.get_matrix(sol="usage")
            if usage_matrix_data:
                headers = list(list(usage_matrix_data.values())[0].keys()) + ["Total"]
                context.update(
                    {
                        "usage_matrix_data": add_total_line_column(usage_matrix_data),
                        "usage_matrix_headers": headers,
                    }
                )

            donut_couverture = charts.CouvertureSolPieChart(diagnostic)
            graphique_couverture = charts.CouvertureSolProgressionChart(diagnostic)
            couverture_data = [SolInterface(i) for i in graphique_couverture.get_series()]
            context.update(
                {
                    "donut_couverture": self.prep_image(
                        donut_couverture.get_temp_image(),
                        width=140,
                    ),
                    "graphique_couverture": self.prep_image(
                        graphique_couverture.get_temp_image(),
                        width=170,
                    ),
                    "couverture_data": couverture_data,
                }
            )

            couverture_matrix_data = diagnostic.get_matrix(sol="couverture")
            if couverture_matrix_data:
                headers = list(list(couverture_matrix_data.values())[0].keys()) + ["Total"]
                context.update(
                    {
                        "couverture_matrix_data": add_total_line_column(couverture_matrix_data),
                        "couverture_matrix_headers": headers,
                    }
                )
            # paragraphe 3.2.1
            chart_waterfall = charts.WaterfallnArtifChart(diagnostic)
            waterfall_series = chart_waterfall.get_series()
            total_artif = diagnostic.get_artif_area()
            artif_net = waterfall_series["net_artif"]
            artificialisation = waterfall_series["new_artif"]
            renaturation = waterfall_series["new_natural"]
            context.update(
                {
                    "surface_artificielle": str(round(total_artif, 2)),
                    "graphique_artificialisation_nette": self.prep_image(
                        chart_waterfall.get_temp_image(),
                        width=170,
                    ),
                    "artificialisation_nette": str(round(artif_net, 2)),
                    "artificialisation": str(round(artificialisation, 2)),
                    "renaturation": str(round(renaturation, 2)),
                    "taux_artificialisation_nette": str(round(100 * artif_net / total_artif, 1)),
                }
            )
            # paragraphe 3.2.2
            detail_artif_chart = charts.DetailCouvArtifChart(diagnostic)
            ReprDetailArtif.total_artif = artificialisation
            ReprDetailArtif.total_renat = renaturation

            nouveau_bati = bati_renature = 0
            for item in detail_artif_chart.get_series():
                if item["code_prefix"] == "CS1.1.1.1":
                    nouveau_bati = item["artif"]
                    bati_renature = item["renat"]

            context.update(
                {
                    "nouveau_bati": str(round(nouveau_bati, 2)),
                    "bati_renature": str(round(bati_renature, 2)),
                    "tableau_artificialisation_par_couverture": [
                        ReprDetailArtif(i) for i in detail_artif_chart.get_series()
                    ],
                    "graphique_artificialisation_par_couverture": self.prep_image(
                        detail_artif_chart.get_temp_image(),
                        width=170,
                    ),
                }
            )
            # paragraphe 3.2.3
            chart_comparison = charts.NetArtifComparaisonChart(diagnostic, level=diagnostic.level)
            table_comparison = add_total_line_column(chart_comparison.get_series())
            header_comparison = list(list(table_comparison.values())[0].keys())
            context.update(
                {
                    "graphique_evolution_artif": self.prep_image(
                        chart_comparison.get_temp_image(),
                        width=170,
                    ),
                    "tableau_evolution_artif": table_comparison,
                    "entetes_evolution_artif": header_comparison,
                }
            )
            # paragraphe 3.2.4
            couv_artif_sol = charts.ArtifCouvSolPieChart(diagnostic)
            usage_artif_sol = charts.ArtifUsageSolPieChart(diagnostic)
            context.update(
                {
                    "graphique_determinant_couv_artif": self.prep_image(
                        couv_artif_sol.get_temp_image(),
                        width=170,
                    ),
                    "graphique_determinant_usage_artif": self.prep_image(
                        usage_artif_sol.get_temp_image(),
                        width=170,
                    ),
                }
            )

        return context

    def get_file_name(self) -> str:
        return self.word_template.filename_mask.format(
            diagnostic_name=self.project.name,
            start_date=self.project.analyse_start_date,
            end_date=self.project.analyse_end_date,
        )
