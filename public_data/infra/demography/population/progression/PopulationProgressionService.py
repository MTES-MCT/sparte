from public_data.domain.demography.population.entity import (
    AnnualPopulation,
    AnnualPopulationCollection,
)
from public_data.domain.demography.population.progression import (
    BasePopulationProgressionService,
)
from public_data.models import Land, LandPop


class PopulationProgressionService(BasePopulationProgressionService):
    def get_by_land(
        self,
        land: Land,
        start_date: int,
        end_date: int,
    ) -> AnnualPopulationCollection:
        pop_data = LandPop.objects.filter(
            land_id=land.id,
            land_type=land.land_type,
            year__gte=start_date,
            year__lte=end_date,
        ).order_by("year")

        return AnnualPopulationCollection(
            land=land,
            start_date=start_date,
            end_date=end_date,
            population=[
                AnnualPopulation(
                    year=p.year,
                    evolution=p.evolution,
                    population=p.population,
                    population_calculated=p.year in [2022],
                    evolution_calculated=p.year in [2021, 2022],
                )
                for p in pop_data
            ],
        )

    def get_by_lands(
        self,
        lands: list[Land],
        start_date: int,
        end_date: int,
    ) -> list[AnnualPopulationCollection]:
        return [
            self.get_by_land(
                land=land,
                start_date=start_date,
                end_date=end_date,
            )
            for land in lands
        ]
