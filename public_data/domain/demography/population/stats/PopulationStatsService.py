from public_data.domain.demography.population.stats.PopulationStats import (
    PopulationStatsAggregation,
    PopulationStatsLand,
    StatsPopulation,
)
from public_data.models import Land, LandPopStats


class PopulationStatsService:
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> PopulationStatsAggregation:
        data = LandPopStats.objects.filter(
            land_id=land.id,
            land_type=land.land_type,
            from_year=start_date,
            to_year=end_date,
        )
        return PopulationStatsAggregation(
            start_date=start_date,
            end_date=end_date,
            population=[
                StatsPopulation(
                    evolution=item.evolution,
                    evolution_percent=item.evolution_percent,
                    comparison_level=item.comparison_level,
                    comparison_id=item.comparison_id,
                )
                for item in data
            ],
        )

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[PopulationStatsLand]:
        if not lands:
            return []

        output = []

        for land in lands:
            output.append(
                PopulationStatsLand(
                    land=land,
                    start_date=start_date,
                    end_date=end_date,
                    population=self.get_by_land(
                        land=land,
                        start_date=start_date,
                        end_date=end_date,
                    ).population,
                )
            )

        return output
