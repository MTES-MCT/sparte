from public_data.domain.consommation.entity.ConsommationStatistics import (
    ConsommationStatistics,
)
from public_data.models import Land, LandConsoStats


class ConsommationStatsService:
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> ConsommationStatistics:
        conso_stats = LandConsoStats.objects.get(
            land_id=land.id,
            land_type=land.land_type,
            from_year=start_date,
            to_year=end_date,
        )
        return ConsommationStatistics(
            land=land,
            start_date=start_date,
            end_date=end_date,
            total=conso_stats.total / 10000,
            total_percent=conso_stats.total_percent,
        )

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[ConsommationStatistics]:
        return [
            self.get_by_land(
                land=land,
                start_date=start_date,
                end_date=end_date,
            )
            for land in lands
        ]
