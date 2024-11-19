from public_data.domain.demography.population.annual.AnnualPopulation import (
    AnnualPopulation,
    AnnualPopulationLand,
)
from public_data.models import Land, LandPop


class AnnualPopulationService:
    @staticmethod
    def get_annual_population(land: Land, year: int) -> AnnualPopulationLand:
        annual_pop = LandPop.objects.get(
            land_id=land.id,
            land_type=land.land_type,
            year=year,
        )

        # TODO: Calculate these fields in airflow
        density = round(annual_pop.population / land.area, 0)
        max_density = 1000

        return AnnualPopulation(
            year=year,
            population=annual_pop.population,
            evolution=annual_pop.evolution,
            density=density,
            max_density=max_density,
        )
