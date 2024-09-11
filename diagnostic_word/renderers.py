import os
import tempfile
from io import BytesIO
from typing import Any, Dict, Optional, Union

from django.db.models import ImageField
from django.utils import timezone
from docx.shared import Mm
from docxtpl import DocxTemplate, InlineImage, RichText

from diagnostic_word.models import WordTemplate
from project import charts
from project.models import Request
from project.utils import add_total_line_column
from public_data.domain.containers import PublicDataContainer
from public_data.domain.impermeabilisation.difference.ImpermeabilisationDifferenceService import (
    ImpermeabilisationDifferenceService,
)
from public_data.infra.consommation.progression.export.ConsoComparisonExportTableMapper import (
    ConsoComparisonExportTableMapper,
)
from public_data.infra.consommation.progression.export.ConsoProportionalComparisonExportTableMapper import (
    ConsoProportionalComparisonExportTableMapper,
)
from public_data.infra.impermeabilisation.difference.export.ImperNetteTableMapper import (
    ImperNetteTableMapper,
)
from public_data.infra.impermeabilisation.difference.export.ImperSolTableMapper import (
    ImperSolTableMapper,
)
from public_data.models.administration import AdminRef
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
        self.label = item["code_prefix"]
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


class BaseRenderer:
    def __init__(self, request: Request, word_template_slug: str):
        self.project = request.project
        self.request = request
        self.word_template = WordTemplate.objects.get(slug=word_template_slug)
        self.context_opened = False
        self.engine = DocxTemplate(self.word_template.docx)

    def __enter__(self) -> "BaseRenderer":
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
        target_2031_consumption = diagnostic.get_bilan_conso()
        current_conso = diagnostic.get_bilan_conso_time_scoped()
        url_diag = get_url_with_domain(diagnostic.get_absolute_url())

        # Flags
        has_different_zan_period = diagnostic.analyse_start_date != "2011" or diagnostic.analyse_end_date != "2020"
        has_neighbors = diagnostic.nb_look_a_like > 0
        is_commune = diagnostic.land_type == AdminRef.COMMUNE

        # Charts
        chart_conso_cities = charts.AnnualConsoChartExport(diagnostic, level=diagnostic.level)
        annual_total_conso_chart = charts.AnnualTotalConsoChartExport(diagnostic)
        det_chart = charts.AnnualConsoByDeterminantChartExport(diagnostic)
        pie_det_chart = charts.ConsoByDeterminantPieChartExport(diagnostic)
        objective_chart = charts.ObjectiveChartExport(diagnostic)

        context = {
            "diagnostic": diagnostic,
            "export_datetime": timezone.localtime(timezone.now()).strftime("Créé le %d/%m/%Y à %H:%M:%S"),
            "nom_territoire": diagnostic.get_territory_name(),
            "surface_totale": str(round(surface_territory, 2)),
            "nb_communes": diagnostic.cities.count(),
            "is_commune": is_commune,
            "url_clickable": self.prep_link(link=url_diag),
            "url": url_diag,
            "project_scope_consumed": current_conso,
            # Flags
            "has_ocsge": diagnostic.has_complete_uniform_ocsge_coverage,
            "has_different_zan_period": has_different_zan_period,
            "has_neighbors": has_neighbors,
            # Maps
            "photo_emprise": self.prep_image(diagnostic.cover_image, height=110),
            # Charts
            "annual_total_conso_chart": self.prep_chart(annual_total_conso_chart),
            "chart_determinants": self.prep_chart(det_chart),
            "pie_chart_determinants": self.prep_chart(pie_det_chart),
            "projection_zan_2031": self.prep_chart(objective_chart),
            # Charts datatables
            "table_headers_years": diagnostic.years + ["Total"],
            "annual_total_conso_data_table": add_total_line_column(
                series=annual_total_conso_chart.get_series(), line=False
            ),
            "communes_data_table": add_total_line_column(chart_conso_cities.get_series()),
            "determinants_data_table": add_total_line_column(det_chart.get_series()),
            # Target 2031
            "target_2031_consumed": target_2031_consumption,
            "projection_zan_cumulee_ref": round(objective_chart.total_2020, 1),
            "projection_zan_annuelle_ref": round(objective_chart.annual_2020, 1),
            "projection_zan_cumulee_objectif": round(objective_chart.conso_2031),
            "projection_zan_annuelle_objectif": round(objective_chart.annual_objective_2031),
        }

        # Comparison territories
        if has_neighbors:
            # Charts
            comparison_chart = charts.AnnualConsoComparisonChartExport(diagnostic)
            comparison_surface_chart = charts.SurfaceChartExport(diagnostic)
            comparison_relative_chart = charts.AnnualConsoProportionalComparisonChartExport(diagnostic)
            context |= {
                # Charts
                "comparison_chart": self.prep_image(comparison_chart.get_temp_image(), width=170),
                "comparison_surface_chart": self.prep_image(comparison_surface_chart.get_temp_image(), width=170),
                "comparison_relative_chart": self.prep_image(comparison_relative_chart.get_temp_image(), width=170),
                # Charts datatables
                "comparison_data_table": ConsoComparisonExportTableMapper.map(
                    consommation_progression=PublicDataContainer.consommation_progression_service().get_by_lands(
                        lands=diagnostic.comparison_lands_and_self_land(),
                        start_date=int(diagnostic.analyse_start_date),
                        end_date=int(diagnostic.analyse_end_date),
                    )
                ),
                "comparison_relative_data_table": ConsoProportionalComparisonExportTableMapper.map(
                    consommation_progression=PublicDataContainer.consommation_progression_service().get_by_lands(
                        lands=diagnostic.comparison_lands_and_self_land(),
                        start_date=int(diagnostic.analyse_start_date),
                        end_date=int(diagnostic.analyse_end_date),
                    )
                ),
            }

        # Consommation
        if not is_commune:
            context |= {
                "carte_consommation": self.prep_image(diagnostic.theme_map_conso, width=170),
                "level_label": diagnostic.level_label.lower(),
            }

        # OCS GE
        if diagnostic.has_complete_uniform_ocsge_coverage:
            # Charts
            couv_artif_sol = charts.ArtifByCouverturePieChartExport(diagnostic)
            usage_artif_sol = charts.ArtifByUsagePieChartExport(diagnostic)
            chart_waterfall = charts.ArtifWaterfallChartExport(diagnostic)

            waterfall_series = chart_waterfall.get_series()
            total_artif = diagnostic.get_artif_area()
            artif_net = waterfall_series["net_artif"]
            artificialisation = waterfall_series["new_artif"]
            renaturation = waterfall_series["new_natural"]
            context |= {
                # Charts datatables
                "debut_ocsge": str(diagnostic.first_year_ocsge),
                "fin_ocsge": str(diagnostic.last_year_ocsge),
                "surface_artificielle": str(round(total_artif, 2)),
                "artificialisation_nette": str(round(artif_net, 2)),
                "artificialisation": str(round(artificialisation, 2)),
                "renaturation": str(round(renaturation, 2)),
                "taux_artificialisation_nette": str(round(100 * artif_net / total_artif, 1)),
                # Charts
                "graphique_artificialisation_nette": self.prep_image(chart_waterfall.get_temp_image(), width=170),
                "graphique_determinant_couv_artif": self.prep_image(couv_artif_sol.get_temp_image(), width=170),
                "graphique_determinant_usage_artif": self.prep_image(usage_artif_sol.get_temp_image(), width=170),
                # Maps
                "carte_artificialisation": self.prep_image(diagnostic.theme_map_artif, width=170),
                "carte_comprendre_artificialisation": self.prep_image(
                    diagnostic.theme_map_understand_artif, width=170
                ),
            }

            # Artif territories sub level
            if not is_commune:
                # Charts
                artif_chart_comparison = charts.NetArtifComparaisonChartExport(diagnostic, level=diagnostic.level)
                context |= {
                    # Charts
                    "graphique_evolution_artif": self.prep_image(artif_chart_comparison.get_temp_image(), width=170),
                    # Charts datatables
                    "tableau_evolution_artif": artif_chart_comparison.get_table(),
                    "entetes_evolution_artif": artif_chart_comparison.get_table_headers(),
                }

        return context

    def get_file_name(self) -> str:
        return self.word_template.filename_mask.format(
            diagnostic_name=self.project.name,
            start_date=self.project.analyse_start_date,
            end_date=self.project.analyse_end_date,
        )


class FullReportRenderer(BaseRenderer):
    def __init__(self, request: Request, word_template_slug="template-bilan-1"):
        super().__init__(request=request, word_template_slug=word_template_slug)


class LocalReportRenderer(BaseRenderer):
    def __init__(self, request: Request, word_template_slug="template-bilan-2"):
        super().__init__(request=request, word_template_slug=word_template_slug)

    def get_context_data(self) -> Dict[str, Any]:
        diagnostic = self.project

        context = super().get_context_data()

        if diagnostic.has_complete_uniform_ocsge_coverage:
            difference = ImpermeabilisationDifferenceService.get_by_geom(
                geom=diagnostic.combined_emprise,
                start_date=diagnostic.first_year_ocsge,
                end_date=diagnostic.last_year_ocsge,
            )
            # Charts datatables
            imper_nette_data_table = ImperNetteTableMapper.map(difference)
            imper_progression_couv_data_table = ImperSolTableMapper.map(difference)["couverture"]
            imper_progression_usage_data_table = ImperSolTableMapper.map(difference)["usage"]
            # Charts
            imper_net_chart = charts.ImperNetteProgressionExport(diagnostic)
            imper_progression_couv_chart = charts.ImperProgressionByCouvertureChartExport(diagnostic)
            imper_repartition_couv_chart = charts.ImperByCouverturePieChartExport(diagnostic)
            imper_progression_usage_chart = charts.ImperProgressionByUsageChartExport(diagnostic)
            imper_repartition_usage_chart = charts.ImperByUsagePieChartExport(diagnostic)

            context |= {
                # Charts datatables
                "imper_nette_data_table": imper_nette_data_table,
                "imper_progression_couv_data_table": imper_progression_couv_data_table,
                "imper_progression_usage_data_table": imper_progression_usage_data_table,
                # Charts
                "graphique_imper_nette": self.prep_chart(chart=imper_net_chart),
                "graphique_progression_imper_couv": self.prep_chart(chart=imper_progression_couv_chart),
                "graphique_repartition_imper_couv": self.prep_chart(chart=imper_repartition_couv_chart),
                "graphique_progression_imper_usage": self.prep_chart(chart=imper_progression_usage_chart),
                "graphique_repartition_imper_usage": self.prep_chart(chart=imper_repartition_usage_chart),
            }

        return context


class ConsoReportRenderer(BaseRenderer):
    def __init__(self, request: Request, word_template_slug="template-bilan-conso"):
        super().__init__(request=request, word_template_slug=word_template_slug)
