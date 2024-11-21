from dependency_injector import containers, providers
from django.core.cache import cache as django_cache

from public_data.infra.PickleClassCacher import PickleClassCacher

from .ClassCacher import ClassCacher
from .consommation.progression.ConsommationProgressionService import (
    ConsommationProgressionService,
)
from .consommation.stats.ConsommationStatsService import ConsommationStatsService
from .demography.population.annual.AnnualPopulationService import (
    AnnualPopulationService,
)
from .demography.population.progression.PopulationProgressionService import (
    PopulationProgressionService,
)
from .demography.population.stats.PopulationStatsService import PopulationStatsService


class PublicDataContainer(containers.DeclarativeContainer):
    config = providers.Configuration()

    class_cacher: ClassCacher = providers.Factory(
        PickleClassCacher,
        cache=django_cache,
    )

    consommation_progression_service = providers.Factory(
        ConsommationProgressionService,
    )

    consommation_stats_service = providers.Factory(
        ConsommationStatsService,
    )

    population_annual_service = providers.Factory(
        AnnualPopulationService,
    )

    population_progression_service = providers.Factory(
        PopulationProgressionService,
    )

    population_stats_service = providers.Factory(
        PopulationStatsService,
    )
