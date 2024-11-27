from public_data.domain.demography.population.entity import PopulationStatistics
from public_data.models import Land, LandPopStats


class PopulationStatsService:
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> PopulationStatistics:
        data = LandPopStats.objects.get(
            land_id=land.id,
            land_type=land.land_type,
            from_year=start_date,
            to_year=end_date,
        )

        return PopulationStatistics(
            land=land,
            start_date=start_date,
            end_date=end_date,
            evolution=data.evolution,
            evolution_percent=data.evolution,
        )

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[PopulationStatistics]:
        return [
            self.get_by_land(
                land=land,
                start_date=start_date,
                end_date=end_date,
            )
            for land in lands
        ]
