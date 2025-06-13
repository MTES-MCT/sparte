import os
import tempfile
from io import BytesIO
from typing import Any, Dict, Optional, Union

from django.db.models import ImageField
from django.utils import timezone
from docx.shared import Mm
from docxtpl import DocxTemplate, InlineImage, RichText

from diagnostic_word.Template import Template
from project import charts
from project.models import Request
from project.utils import add_total_line_column
from public_data.domain.containers import PublicDataContainer
from public_data.infra.consommation.progression.export.ConsoByDeterminantExportTableMapper import (
    ConsoByDeterminantExportTableMapper,
)
from public_data.infra.consommation.progression.export.ConsoComparisonExportTableMapper import (
    ConsoComparisonExportTableMapper,
)
from public_data.infra.consommation.progression.export.ConsoProportionalComparisonExportTableMapper import (
    ConsoProportionalComparisonExportTableMapper,
)
from public_data.models import LandArtifStockIndex, LandModel
from public_data.models.administration import AdminRef, Land
from utils.functions import get_url_with_domain


def save_to_local_temp_image(field: ImageField) -> str:
    """Save an image to a temporary file and return its path."""
    fd, img_path = tempfile.mkstemp(suffix=".png", text=False)
    os.write(fd, field.open().read())
    os.close(fd)
    return img_path


class BaseRenderer:
    def __init__(self, request: Request, word_template: Template):
        self.word_template = word_template
        self.project = request.project
        self.request = request
        self.context_opened = False
        self.engine = DocxTemplate(os.path.join(os.path.dirname(__file__), word_template.docx))

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

    def prep_chart(self, chart, width=1000):
        return self.prep_image(chart.get_temp_image(width=width), width=170)

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

        # Land
        land_model = LandModel.objects.get(
            land_id=diagnostic.land_id,
            land_type=diagnostic.land_type,
        )
        # Flags
        has_different_zan_period = diagnostic.analyse_start_date != "2011" or diagnostic.analyse_end_date != "2020"
        has_neighbors = diagnostic.nb_look_a_like > 0
        is_commune = diagnostic.land_type == AdminRef.COMMUNE
        has_ocsge = land_model.has_ocsge
        has_zonage = land_model.has_zonage

        # Charts
        annual_total_conso_chart = charts.AnnualTotalConsoChartExport(diagnostic)

        if diagnostic.land_type == AdminRef.COMMUNE:
            annual_total_conso_data_table = add_total_line_column(annual_total_conso_chart.get_series(), line=False)
        else:
            # TODO : refactor to only use new type of land model
            child_lands = LandModel.objects.filter(
                parent_keys__contains=[f"{diagnostic.land_type}_{diagnostic.land_id}"], land_type=diagnostic.level
            )
            old_lands = [Land(f"{land.land_type}_{land.land_id}") for land in child_lands]

            communes_conso = PublicDataContainer.consommation_progression_service().get_by_lands(
                lands=old_lands,
                start_date=int(diagnostic.analyse_start_date),
                end_date=int(diagnostic.analyse_end_date),
            )

            annual_total_conso_data_table = {}

            for commune_conso in communes_conso:
                annual_total_conso_data_table[commune_conso.land.name] = {
                    f"{year.year}": year.total for year in commune_conso.consommation
                }

            annual_total_conso_data_table = add_total_line_column(annual_total_conso_data_table, line=False)

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
            "has_different_zan_period": has_different_zan_period,
            "has_neighbors": has_neighbors,
            "has_zonage": has_zonage,
            "has_ocsge": has_ocsge,
            "is_interdepartemental": land_model.is_interdepartemental,
            # Maps
            "photo_emprise": self.prep_image(diagnostic.cover_image, height=110),
            # Charts
            "annual_total_conso_chart": self.prep_chart(annual_total_conso_chart),
            "chart_determinants": self.prep_chart(det_chart),
            "pie_chart_determinants": self.prep_chart(pie_det_chart),
            "projection_zan_2031": self.prep_chart(objective_chart),
            # Charts datatables
            "table_headers_years": diagnostic.years + ["Total"],
            "annual_total_conso_data_table": annual_total_conso_data_table,
            "determinants_data_table": ConsoByDeterminantExportTableMapper.map(
                consommation_progression=PublicDataContainer.consommation_progression_service()
                .get_by_land(
                    land=diagnostic.land_proxy,
                    start_date=int(diagnostic.analyse_start_date),
                    end_date=int(diagnostic.analyse_end_date),
                )
                .consommation
            ),
            # Target 2031
            "target_2031_consumed": target_2031_consumption,
            "projection_zan_cumulee_ref": round(objective_chart.total_2020, 1),
            "projection_zan_annuelle_ref": round(objective_chart.annual_2020, 1),
            "projection_zan_cumulee_objectif": round(objective_chart.conso_2031),
            "projection_zan_annuelle_objectif": round(objective_chart.annual_objective_2031),
        }

        if has_ocsge:
            last_artif_stock_index = (
                LandArtifStockIndex.objects.filter(
                    land_id=diagnostic.land_id,
                    land_type=diagnostic.land_type,
                )
                .order_by("-millesime_index")
                .first()
            )

            artif_couverture_chart = charts.ArtifByCouverturePieChartExport(
                land=land_model,
                params={
                    "index": last_artif_stock_index.millesime_index,
                },
            )

            artif_usage_chart = charts.ArtifUsagePieChartExport(
                land=land_model,
                params={
                    "index": last_artif_stock_index.millesime_index,
                },
            )

            context |= {
                "last_ocsge_millesime": ", ".join(map(str, last_artif_stock_index.years)),
                "last_ocsge_millesime_index": last_artif_stock_index.millesime_index,
                "last_surface_artif": round(last_artif_stock_index.surface, 2),
                "flux_artif": round(last_artif_stock_index.flux_surface, 2),
                "flux_artif_previous_year": ", ".join(map(str, last_artif_stock_index.flux_previous_years)),
                "flux_artif_previous_index": last_artif_stock_index.millesime_index - 1,
                "last_percent_artif": round(last_artif_stock_index.percent, 2),
                "available_ocsge_millesimes": land_model.millesimes,
                "artif_couverture_chart": self.prep_chart(artif_couverture_chart),
                "artif_couverture_data_table": artif_couverture_chart.data_table,
                "artif_usage_chart": self.prep_chart(artif_usage_chart),
                "artif_usage_data_table": artif_usage_chart.data_table,
            }
            if not is_commune:
                artif_map_chart = charts.ArtifMapExport(
                    land=land_model,
                    params={
                        "index": last_artif_stock_index.millesime_index,
                        "previous_index": last_artif_stock_index.millesime_index - 1,
                        "child_land_type": land_model.child_land_types[0],
                    },
                )
                context |= {
                    "artif_map": self.prep_chart(artif_map_chart, width=1200),
                    "artif_map_data_table": artif_map_chart.data_table,
                    "maille_artif_map": f"{AdminRef.get_label(land_model.child_land_types[0]).lower()}s",
                }

        # Comparison territories
        if has_neighbors:
            # Charts
            comparison_chart = charts.AnnualConsoComparisonChartExport(diagnostic)
            comparison_relative_chart = charts.AnnualConsoProportionalComparisonChartExport(diagnostic)
            context |= {
                # Charts
                "comparison_chart": self.prep_image(comparison_chart.get_temp_image(), width=170),
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

        if not is_commune:
            # Consommation
            context |= {
                "carte_consommation": self.prep_image(diagnostic.theme_map_conso, width=170),
                "level_label": diagnostic.level_label.lower(),
            }
        return context

    def get_file_name(self) -> str:
        return self.word_template.filename_template.format(
            diagnostic_name=self.project.name,
            start_date=self.project.analyse_start_date,
            end_date=self.project.analyse_end_date,
        )
