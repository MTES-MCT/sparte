from dependency_injector import containers, providers
from django.core.cache import cache as django_cache

from public_data.infra.PickleClassCacher import PickleClassCacher

from .ClassCacher import ClassCacher
from .consommation.progression.ConsommationProgressionService import (
    ConsommationProgressionService,
)


class PublicDataContainer(containers.DeclarativeContainer):
    config = providers.Configuration()

    class_cacher: ClassCacher = providers.Factory(
        PickleClassCacher,
        cache=django_cache,
    )

    consommation_progression_service = providers.Factory(
        ConsommationProgressionService,
        class_cacher=class_cacher,
    )
