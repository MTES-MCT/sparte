from public_data.domain.demography.population.progression.PopulationProgression import (
    AnnualPopulation,
    PopulationProgressionAggregation,
    PopulationProgressionLand,
)
from public_data.models import Land, LandPop


class PopulationProgressionService:
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> PopulationProgressionAggregation:
        pop_data = LandPop.objects.filter(
            land_id=land.id,
            land_type=land.land_type,
            year__gte=start_date,
            year__lte=end_date,
        ).order_by("year")
        return PopulationProgressionAggregation(
            start_date=start_date,
            end_date=end_date,
            population=[
                AnnualPopulation(
                    year=p.year,
                    evolution=p.evolution,
                    population=p.population,
                )
                for p in pop_data
            ],
        )

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[PopulationProgressionLand]:
        if not lands:
            return []

        output = []

        for land in lands:
            output.append(
                PopulationProgressionLand(
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
