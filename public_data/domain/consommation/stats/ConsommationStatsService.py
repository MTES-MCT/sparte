from public_data.domain.consommation.stats.ConsommationStats import (
    ConsommationStats,
    ConsommationStatsAggregation,
    ConsommationStatsLand,
)
from public_data.models import Land, LandConsoStats


class ConsommationStatsService:
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> ConsommationStatsAggregation:
        data = LandConsoStats.objects.filter(
            land_id=land.id,
            land_type=land.land_type,
            from_year=start_date,
            to_year=end_date,
        )
        return ConsommationStatsAggregation(
            start_date=start_date,
            end_date=end_date,
            consommation=[
                ConsommationStats(
                    total=item.total,
                    total_hectare=item.total / 10000,
                    total_percent=item.total_percent,
                )
                for item in data
            ],
        )

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[ConsommationStatsLand]:
        if not lands:
            return []

        output = []

        for land in lands:
            output.append(
                ConsommationStatsLand(
                    land=land,
                    start_date=start_date,
                    end_date=end_date,
                    consommation=self.get_by_land(
                        land=land,
                        start_date=start_date,
                        end_date=end_date,
                    ).consommation,
                )
            )

        return output
