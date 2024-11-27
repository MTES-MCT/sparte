from public_data.domain.demography.population.entity import (
    PopulationStatisticsComparison,
)
from public_data.domain.demography.population.stats import (
    BasePopulationStatsComparisonService,
)
from public_data.models import Land, LandPopComparison, LandPopStats


class PopulationStatsComparisonService(BasePopulationStatsComparisonService):
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> PopulationStatisticsComparison:
        pop_stats = LandPopStats.objects.get(
            land_id=land.id,
            land_type=land.land_type,
            from_year=start_date,
            to_year=end_date,
        )
        pop_comparison = LandPopComparison.objects.get(
            land_id=pop_stats.comparison_id,
            land_type=pop_stats.comparison_level,
            from_year=start_date,
            to_year=end_date,
        )
        return PopulationStatisticsComparison(
            land=land,
            start_date=start_date,
            end_date=end_date,
            evolution_median=pop_comparison.evolution_median,
            relevance_level=pop_comparison.relevance_level,
        )

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[PopulationStatisticsComparison]:
        return [
            self.get_by_land(
                land=land,
                start_date=start_date,
                end_date=end_date,
            )
            for land in lands
        ]
