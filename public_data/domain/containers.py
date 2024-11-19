from dependency_injector import containers, providers
from django.core.cache import cache as django_cache

from public_data.infra.PickleClassCacher import PickleClassCacher

from .ClassCacher import ClassCacher
from .consommation.progression.ConsommationProgressionService import (
    ConsommationProgressionService,
)
from .demography.population.annual.AnnualPopulationService import (
    AnnualPopulationService,
)
from .demography.population.progression.PopulationProgressionService import (
    PopulationProgressionService,
)


class PublicDataContainer(containers.DeclarativeContainer):
    config = providers.Configuration()

    class_cacher: ClassCacher = providers.Factory(
        PickleClassCacher,
        cache=django_cache,
    )

    consommation_progression_service = providers.Factory(
        ConsommationProgressionService,
    )

    population_annual_service = providers.Factory(
        AnnualPopulationService,
    )

    population_progression_service = providers.Factory(
        PopulationProgressionService,
    )
