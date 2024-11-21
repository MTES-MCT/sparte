import math

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

        # Nombre d'habitants par hectare
        density = math.ceil(annual_pop.population / land.area)

        return AnnualPopulation(
            year=year,
            population=annual_pop.population,
            evolution=annual_pop.evolution,
            density=density,
        )
