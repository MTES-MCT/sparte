from dependency_injector import containers, providers
from django.core.cache import cache as django_cache

from public_data.infra.consommation.progression import ConsommationProgressionService
from public_data.infra.consommation.stats import (
    ConsommationStatsComparisonService,
    ConsommationStatsService,
)
from public_data.infra.demography.population.progression import (
    PopulationProgressionService,
)
from public_data.infra.demography.population.stats.PopulationStatsService import (
    PopulationStatsService,
)
from public_data.infra.PickleClassCacher import PickleClassCacher
from public_data.infra.urbanisme.autorisation_logement.progression.AutorisationLogementProgressionService import (
    AutorisationLogementProgressionService,
)
from public_data.infra.urbanisme.logement_vacant.progression.LogementVacantProgressionService import (
    LogementVacantProgressionService,
)


class PublicDataContainer(containers.DeclarativeContainer):
    config = providers.Configuration()

    class_cacher = providers.Factory(
        PickleClassCacher,
        cache=django_cache,
    )
    # consommation

    consommation_progression_service = providers.Factory(
        ConsommationProgressionService,
    )

    consommation_stats_service = providers.Factory(
        ConsommationStatsService,
    )

    consommation_comparison_service = providers.Factory(
        ConsommationStatsComparisonService,
    )

    # population

    population_progression_service = providers.Factory(
        PopulationProgressionService,
    )

    population_stats_service = providers.Factory(
        PopulationStatsService,
    )

    # urbanisme

    autorisation_logement_progression_service = providers.Factory(
        AutorisationLogementProgressionService,
    )

    logement_vacant_progression_service = providers.Factory(
        LogementVacantProgressionService,
    )
