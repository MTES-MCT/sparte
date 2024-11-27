from dataclasses import dataclass

from public_data.models import Land

from .AnnualPopulation import AnnualPopulation


@dataclass(frozen=True, slots=True)
class PopulationProgressionCollectionLand:
    land: Land
    start_date: int
    end_date: int
    population: list[AnnualPopulation]
