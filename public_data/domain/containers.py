from dependency_injector import containers, providers
from django.core.cache import cache as django_cache

# domain
from public_data.domain.ClassCacher import ClassCacher
from public_data.domain.consommation.progression import (
    BaseConsommationProgressionService,
)
from public_data.domain.consommation.stats import BaseConsommationStatsService
from public_data.domain.demography.population.progression import (
    BasePopulationProgressionService,
)
from public_data.domain.demography.population.stats import BasePopulationStatsService
from public_data.infra.consommation.progression import ConsommationProgressionService
from public_data.infra.consommation.stats import ConsommationStatsService
from public_data.infra.demography.population.progression import (
    PopulationProgressionService,
)
from public_data.infra.demography.population.stats.PopulationStatsService import (
    PopulationStatsService,
)

# infra
from public_data.infra.PickleClassCacher import PickleClassCacher


class PublicDataContainer(containers.DeclarativeContainer):
    config = providers.Configuration()

    class_cacher: ClassCacher = providers.Factory(
        PickleClassCacher,
        cache=django_cache,
    )

    consommation_progression_service: BaseConsommationProgressionService = providers.Factory(
        ConsommationProgressionService,
    )

    consommation_stats_service: BaseConsommationStatsService = providers.Factory(
        ConsommationStatsService,
    )

    population_progression_service: BasePopulationProgressionService = providers.Factory(
        PopulationProgressionService,
    )

    population_stats_service: BasePopulationStatsService = providers.Factory(
        PopulationStatsService,
    )
