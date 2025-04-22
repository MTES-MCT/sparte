from project import charts
from project.models import Project
from public_data.domain.containers import PublicDataContainer
from public_data.infra.urbanisme.autorisation_logement.progression.table.LogementVacantAutorisationConstructionRatioProgressionTableMapper import (  # noqa: E501
    LogementVacantAutorisationConstructionRatioProgressionTableMapper,
)
from public_data.infra.urbanisme.logement_vacant.progression.table.LogementVacantAutorisationConstructionComparisonTableMapper import (  # noqa: E501
    LogementVacantAutorisationConstructionComparisonTableMapper,
)
from public_data.infra.urbanisme.logement_vacant.progression.table.LogementVacantConsoProgressionTableMapper import (
    LogementVacantConsoProgressionTableMapper,
)
from public_data.infra.urbanisme.logement_vacant.progression.table.LogementVacantProgressionTableMapper import (
    LogementVacantProgressionTableMapper,
)
from public_data.infra.urbanisme.logement_vacant.progression.table.LogementVacantRatioProgressionTableMapper import (
    LogementVacantRatioProgressionTableMapper,
)

from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticLogementVacantView(DiagnosticBaseView):
    partial_template_name = "project/components/dashboard/logement_vacant.html"
    full_template_name = "project/pages/logement_vacant.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()
        start_date = 2019
        end_date = 2023
        end_date_conso = 2022
        has_logement_vacant = project.logements_vacants_available
        has_autorisation_logement = project.autorisation_logement_available

        logement_vacant_progression = PublicDataContainer.logement_vacant_progression_service().get_by_land(
            land=project.land_proxy,
            start_date=start_date,
            end_date=end_date,
        )

        consommation_progression = PublicDataContainer.consommation_progression_service().get_by_land(
            land=project.land_proxy,
            start_date=start_date,
            end_date=end_date_conso,
        )

        kwargs.update(
            {
                "diagnostic": project,
                "has_autorisation_logement": has_autorisation_logement,
                "logement_vacant_last_year": logement_vacant_progression.get_last_year_logement_vacant(),
                # Charts
                "logement_vacant_progression_chart": (
                    charts.LogementVacantProgressionChart(
                        project,
                        start_date=start_date,
                        end_date=end_date,
                    )
                ),
                "logement_vacant_ratio_progression_chart": (
                    charts.LogementVacantRatioProgressionChart(
                        project,
                        start_date=start_date,
                        end_date=end_date,
                    )
                ),
                "logement_vacant_conso_progression_chart": (
                    charts.LogementVacantConsoProgressionChart(
                        project,
                        start_date=start_date,
                        end_date=end_date_conso,
                    )
                ),
                # Data tables
                "logement_vacant_progression_data_table": (
                    LogementVacantProgressionTableMapper.map(
                        logement_vacant_progression=logement_vacant_progression,
                    )
                ),
                "logement_vacant_ratio_progression_data_table": (
                    LogementVacantRatioProgressionTableMapper.map(
                        logement_vacant_progression=logement_vacant_progression,
                    )
                ),
                "logement_vacant_conso_progression_data_table": (
                    LogementVacantConsoProgressionTableMapper.map(
                        logement_vacant_progression=logement_vacant_progression,
                        consommation_progression=consommation_progression,
                    )
                ),
            }
        )

        if has_logement_vacant and has_autorisation_logement:
            autorisation_logement_progression = (
                PublicDataContainer.autorisation_logement_progression_service().get_by_land(
                    land=project.land_proxy,
                    start_date=start_date,
                    end_date=end_date,
                )
            )

            kwargs.update(
                {
                    "autorisation_logement_last_year": autorisation_logement_progression.get_last_year_autorisation_logement(),  # noqa: E501
                    # Charts
                    "logement_vacant_autorisation_construction_comparison_chart": (
                        charts.LogementVacantAutorisationLogementComparisonChart(
                            project,
                            start_date=start_date,
                            end_date=end_date,
                        )
                    ),
                    "logement_vacant_autorisation_construction_ratio_gauge_chart": (
                        charts.LogementVacantAutorisationLogementRatioGaugeChart(
                            project,
                            start_date=start_date,
                            end_date=end_date,
                        )
                    ),
                    "logement_vacant_autorisation_logement_ratio_progression_chart": (
                        charts.LogementVacantAutorisationLogementRatioProgressionChart(
                            project,
                            start_date=start_date,
                            end_date=end_date,
                        )
                    ),
                    # Data tables
                    "logement_vacant_autorisation_construction_comparison_data_table": (
                        LogementVacantAutorisationConstructionComparisonTableMapper.map(
                            logement_vacant_progression=logement_vacant_progression,
                            autorisation_logement_progression=autorisation_logement_progression,
                        )
                    ),
                    "logement_vacant_autorisation_logement_ratio_progression_data_table": (
                        LogementVacantAutorisationConstructionRatioProgressionTableMapper.map(
                            autorisation_logement_progression=autorisation_logement_progression,
                        )
                    ),
                }
            )

        return super().get_context_data(**kwargs)
