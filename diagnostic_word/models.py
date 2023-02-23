from io import BytesIO
from pathlib import Path
from typing import Any, Dict, Optional
from django.db import models
from django.urls import reverse
from docx.shared import Mm
from docxtpl import DocxTemplate, InlineImage, RichText

from project import charts
from project.models.project_base import Project
from project.utils import add_total_line_column
from utils.functions import get_url_with_domain


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


class WordTemplate(models.Model):
    """TODO : faire une migration pour migrer l'ancien model et ne pas avoir à faire de createview"""

    slug = models.SlugField("Slug", primary_key=True)
    description = models.TextField("Description")
    docx = models.FileField("Modèle Word", upload_to="word_templates")
    last_update = models.DateTimeField("Dernière mise à jour", auto_now=True)

    def get_absolute_url(self):
        return reverse("word_template:update", args={"slug": self.slug})

    def merge(self, project_id: int) -> BytesIO:
        """Load actual docx file and merge all fields. Return the final doc as BytesIO."""
        self.project = Project.objects.get(pk=project_id)
        self.template_file = DocxTemplate(self.docx)
        context = self.get_context_data()
        self.template_file.render(context)
        buffer = BytesIO()
        self.template_file.save(buffer)
        buffer.seek(0)
        return buffer

    def prep_image(
        self, img_path: str, width: Optional[int] = None, height: Optional[int] = None
    ) -> InlineImage:
        if not Path(img_path).is_file():
            raise ValueError("Provided path is not a file")
        return InlineImage(
            self.template_file,
            img_path,
            width=Mm(width) if width else None,
            height=Mm(height) if height else None,
        )

    def prep_link(self, link: str, text: Optional[str] = None) -> RichText:
        if not text:
            text = link
        rt = RichText()
        rt.add(text, url_id=self.template_file.build_url_id(link))
        return rt

    def get_context_data(self) -> Dict[str, Any]:
        surface_territory = self.project.area
        context = {
            "diagnostic": self.project,
            "nom_territoire": self.project.get_territory_name(),
            "surface_totale": str(round(surface_territory, 2)),
            "ocsge_is_available": False,
            "periode_differente_zan": (
                self.project.analyse_start_date != "2011"
                or self.project.analyse_end_date != "2020"
            ),
            "project": self.project,
            "photo_emprise": self.prep_image(self.project.cover_image, height=110),
            "nb_communes": self.project.cities.count(),
            "carte_consommation": self.prep_image(
                self.project.theme_map_conso, width=170
            ),
            "carte_artificialisation": self.prep_image(
                self.project.theme_map_artif, width=170
            ),
            "carte_comprendre_artificialisation": self.prep_image(
                self.project.theme_map_understand_artif, width=170
            ),
        }

        target_2031_consumption = self.project.get_bilan_conso()
        current_conso = self.project.get_bilan_conso_time_scoped()

        # Consommation des communes
        chart_conso_cities = charts.ConsoCommuneChart(
            self.project, level=self.project.level
        )

        # comparison charts
        nb_neighbors = self.project.nb_look_a_like
        voisins = list()
        if nb_neighbors > 0:
            comparison_chart = charts.ConsoComparisonChart(self.project, relative=False)
            comparison_relative_chart = charts.ConsoComparisonChart(
                self.project, relative=True
            )
            voisins = self.project.get_look_a_like()
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
                    "comparison_data_table": add_total_line_column(
                        comparison_chart.get_series()
                    ),
                }
            )

        # Déterminants
        det_chart = charts.DeterminantPerYearChart(self.project)
        pie_det_chart = charts.DeterminantPieChart(self.project)

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
        objective_chart = charts.ObjectiveChart(self.project)

        url_diag = get_url_with_domain(self.project.get_absolute_url())

        context.update(
            {
                "nb_voisins": nb_neighbors,
                "url_clickable": self.prep_link(link=url_diag),
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
                "project_scope_annual_avg": current_conso / self.project.nb_years,
                "project_scope_nb_years": self.project.nb_years,
                "project_scope_nb_years_before_31": self.project.nb_years_before_2031,
                "project_scope_forecast_2031": self.project.nb_years_before_2031
                * current_conso
                / self.project.nb_years,
                # charts
                "chart_conso_communes": self.prep_image(
                    chart_conso_cities.get_temp_image(),
                    width=170,
                ),
                "chart_determinants": self.prep_image(
                    det_chart.get_temp_image(),
                    width=170,
                ),
                "pie_chart_determinants": self.prep_image(
                    pie_det_chart.get_temp_image(),
                    width=140,
                ),
                "projection_zan_2031": self.prep_image(
                    objective_chart.get_temp_image(),
                    width=170,
                ),
                "projection_zan_cumulee_ref": round(objective_chart.total_real, 1),
                "projection_zan_annuelle_ref": round(objective_chart.annual_real, 1),
                "projection_zan_cumulee_objectif": round(objective_chart.conso_2031),
                "projection_zan_annuelle_objectif": round(
                    objective_chart.annual_objective_2031
                ),
            }
        )

        if self.project.is_artif():
            context.update(
                {
                    "ocsge_is_available": True,
                    "debut_ocsge": str(self.project.first_year_ocsge),
                    "fin_ocsge": str(self.project.last_year_ocsge),
                    "usage_matrix_data": dict(),
                    "usage_matrix_headers": dict(),
                    "couverture_matrix_data": dict(),
                    "couverture_matrix_headers": dict(),
                }
            )

            SolInterface.surface_territory = surface_territory
            donut_usage = charts.UsageSolPieChart(self.project)
            graphique_usage = charts.UsageSolProgressionChart(self.project)
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

            usage_matrix_data = self.project.get_matrix(sol="usage")
            if usage_matrix_data:
                headers = list(list(usage_matrix_data.values())[0].keys()) + ["Total"]
                context.update(
                    {
                        "usage_matrix_data": add_total_line_column(usage_matrix_data),
                        "usage_matrix_headers": headers,
                    }
                )

            donut_couverture = charts.CouvertureSolPieChart(self.project)
            graphique_couverture = charts.CouvertureSolProgressionChart(self.project)
            couverture_data = [
                SolInterface(i) for i in graphique_couverture.get_series()
            ]
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

            couverture_matrix_data = self.project.get_matrix(sol="couverture")
            if couverture_matrix_data:
                headers = list(list(couverture_matrix_data.values())[0].keys()) + [
                    "Total"
                ]
                context.update(
                    {
                        "couverture_matrix_data": add_total_line_column(
                            couverture_matrix_data
                        ),
                        "couverture_matrix_headers": headers,
                    }
                )
            # paragraphe 3.2.1
            chart_waterfall = charts.WaterfallnArtifChart(self.project)
            waterfall_series = chart_waterfall.get_series()
            total_artif = self.project.get_artif_area()
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
                    "taux_artificialisation_nette": str(
                        round(100 * artif_net / total_artif, 1)
                    ),
                }
            )
            # paragraphe 3.2.2
            detail_artif_chart = charts.DetailArtifChart(self.project)
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
            chart_comparison = charts.NetArtifComparaisonChart(
                self.project, level=self.project.level
            )
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
            couv_artif_sol = charts.ArtifCouvSolPieChart(self.project)
            usage_artif_sol = charts.ArtifUsageSolPieChart(self.project)
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
