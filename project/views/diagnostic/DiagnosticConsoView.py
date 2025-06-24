from project import charts
from project.models import Project
from project.utils import add_total_line_column
from public_data.domain.containers import PublicDataContainer
from public_data.infra.consommation.progression.table.ConsoByDeterminantTableMapper import (
    ConsoByDeterminantTableMapper,
)
from public_data.infra.consommation.progression.table.ConsoComparisonTableMapper import (
    ConsoComparisonMapper,
)
from public_data.infra.consommation.progression.table.ConsoProportionalComparisonTableMapper import (
    ConsoProportionalComparisonTableMapper,
)
from public_data.infra.demography.population.progression.table.PopulationConsoComparisonTableMapper import (
    PopulationConsoComparisonTableMapper,
)
from public_data.infra.demography.population.progression.table.PopulationConsoProgressionTableMapper import (
    PopulationConsoProgressionTableMapper,
)
from public_data.models.administration import AdminRef, Land, LandModel

from .DiagnosticBaseView import DiagnosticBaseView


class DiagnosticConsoView(DiagnosticBaseView):
    partial_template_name = "project/components/dashboard/consommation.html"
    full_template_name = "project/pages/consommation.html"

    def get_context_data(self, **kwargs):
        project: Project = self.get_object()
        # Retrieve request level of analysis
        level = self.request.GET.get("level_conso", project.level)

        # communes_data_graph
        annual_total_conso_chart = charts.AnnualTotalConsoChart(project, level=level)
        if project.land_type == AdminRef.COMMUNE:
            annual_conso_data_table = add_total_line_column(annual_total_conso_chart.get_series(), line=False)
        else:
            # TODO : refactor to only use new type of land model
            child_lands = LandModel.objects.filter(
                parent_keys__contains=[f"{project.land_type}_{project.land_id}"], land_type=level
            )
            old_lands = [Land(f"{land.land_type}_{land.land_id}") for land in child_lands]

            communes_conso = PublicDataContainer.consommation_progression_service().get_by_lands(
                lands=old_lands,
                start_date=int(project.analyse_start_date),
                end_date=int(project.analyse_end_date),
            )

            annual_conso_data_table = {}

            for commune_conso in communes_conso:
                annual_conso_data_table[commune_conso.land.name] = {
                    f"{year.year}": year.total for year in commune_conso.consommation
                }

            annual_conso_data_table = add_total_line_column(annual_conso_data_table)

        conso_period = project.get_bilan_conso_time_scoped()

        # Déterminants
        det_chart = charts.AnnualConsoByDeterminantChart(project)
        det_pie_chart = charts.ConsoByDeterminantPieChart(project)

        # CONSO
        consommation_progression = (
            PublicDataContainer.consommation_progression_service()
            .get_by_land(
                land=project.land_proxy,
                start_date=int(project.analyse_start_date),
                end_date=int(project.analyse_end_date),
            )
            .consommation
        )
        consommation_stats = PublicDataContainer.consommation_stats_service().get_by_land(
            project.land_proxy, project.analyse_start_date, project.analyse_end_date
        )
        consommation_comparison_stats = PublicDataContainer.consommation_stats_service().get_by_lands(
            lands=project.comparison_lands_and_self_land(),
            start_date=int(project.analyse_start_date),
            end_date=int(project.analyse_end_date),
        )

        # INSEE
        population_progression = (
            PublicDataContainer.population_progression_service()
            .get_by_land(
                land=project.land_proxy,
                start_date=int(project.analyse_start_date),
                end_date=int(project.analyse_end_date),
            )
            .population
        )
        population_stats = PublicDataContainer.population_stats_service().get_by_land(
            project.land_proxy, project.analyse_start_date, project.analyse_end_date
        )
        population_comparison_stats = PublicDataContainer.population_stats_service().get_by_lands(
            lands=project.comparison_lands_and_self_land(),
            start_date=int(project.analyse_start_date),
            end_date=int(project.analyse_end_date),
        )
        population_comparison_progression = PublicDataContainer.population_progression_service().get_by_lands(
            lands=project.comparison_lands_and_self_land(),
            start_date=int(project.analyse_start_date),
            end_date=int(project.analyse_end_date),
        )

        kwargs.update(
            {
                "diagnostic": project,
                "total_surface": project.area,
                "conso_period": conso_period,
                "is_commune": project.land_type == AdminRef.COMMUNE,
                "population_evolution": population_stats.evolution,
                "population_evolution_abs": abs(population_stats.evolution),
                "population_evolution_percent": population_stats.evolution_percent,
                "consommation_total": consommation_stats.total,
                "consommation_total_percent_of_area": consommation_stats.total_percent_of_area,
                # charts
                "determinant_per_year_chart": det_chart,
                "determinant_pie_chart": det_pie_chart,
                "comparison_chart": charts.AnnualConsoComparisonChart(project),
                "annual_total_conso_chart": annual_total_conso_chart,
                "surface_proportional_chart": charts.AnnualConsoProportionalComparisonChart(self.object),
                "population_density_chart": charts.PopulationDensityChart(project),
                "population_conso_progression_chart": charts.PopulationConsoProgressionChart(project),
                "population_conso_comparison_chart": charts.PopulationConsoComparisonChart(project),
                # data tables
                "annual_conso_data_table": annual_conso_data_table,
                "determinant_data_table": ConsoByDeterminantTableMapper.map(
                    consommation_progression=PublicDataContainer.consommation_progression_service()
                    .get_by_land(
                        land=project.land_proxy,
                        start_date=int(project.analyse_start_date),
                        end_date=int(project.analyse_end_date),
                    )
                    .consommation
                ),
                "comparison_table": ConsoComparisonMapper.map(
                    consommation_progression=PublicDataContainer.consommation_progression_service().get_by_lands(
                        lands=project.comparison_lands_and_self_land(),
                        start_date=int(project.analyse_start_date),
                        end_date=int(project.analyse_end_date),
                    )
                ),
                "surface_proportional_data_table": ConsoProportionalComparisonTableMapper.map(
                    consommation_progression=PublicDataContainer.consommation_progression_service().get_by_lands(
                        lands=project.comparison_lands_and_self_land(),
                        start_date=int(project.analyse_start_date),
                        end_date=int(project.analyse_end_date),
                    )
                ),
                "population_progression_table": PopulationConsoProgressionTableMapper.map(
                    consommation_progression, population_progression
                ),
                "population_comparison_table": PopulationConsoComparisonTableMapper.map(
                    from_year=int(project.analyse_start_date),
                    to_year=int(project.analyse_end_date),
                    consommation_comparison_stats=consommation_comparison_stats,
                    population_comparison_stats=population_comparison_stats,
                    population_comparison_progression=population_comparison_progression,
                ),
            }
        )

        return super().get_context_data(**kwargs)
