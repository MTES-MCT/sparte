from public_data.domain.consommation.entity import ConsommationStatisticsComparison
from public_data.domain.consommation.stats import BaseConsommationStatsComparisonService
from public_data.models import Land, LandConsoComparison, LandConsoStats


class ConsommationStatsComparisonService(BaseConsommationStatsComparisonService):
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> ConsommationStatisticsComparison:
        conso_stats = LandConsoStats.objects.get(
            land_id=land.id,
            land_type=land.land_type,
            from_year=start_date,
            to_year=end_date,
        )
        conso_comparison = LandConsoComparison.objects.get(
            land_id=conso_stats.comparison_id,
            land_type=conso_stats.comparison_level,
            from_year=start_date,
            to_year=end_date,
        )
        return ConsommationStatisticsComparison(
            land=land,
            start_date=start_date,
            end_date=end_date,
            total_median=conso_comparison.total_median / 10000,
            relevance_level=conso_comparison.relevance_level,
        )

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[ConsommationStatisticsComparison]:
        return [
            self.get_by_land(
                land=land,
                start_date=start_date,
                end_date=end_date,
            )
            for land in lands
        ]