import logging
from typing import Callable, Tuple

from django.core.management.base import BaseCommand

from public_data import loaders
from public_data.factories import LayerMapperFactory
from public_data.models import DataSource

logger = logging.getLogger("management.commands")


class CeremaFactory(LayerMapperFactory):
    def get_base_class(self) -> Tuple[Callable]:
        base_class = loaders.BaseLoadCeremaDromCom
        if self.data_source.official_land_id == "MetropoleEtCorse":
            base_class = loaders.BaseLoadCerema
        return (base_class,)


class Command(BaseCommand):
    help = "Load data from Cerema"

    def add_arguments(self, parser):
        parser.add_argument(
            "--verbose",
            action="store_true",
            help="reduce output",
        )
        parser.add_argument(
            "--official_land_ids",
            nargs="+",
            type=int,
            help="Select what to to load using official land id source's property",
        )

    def get_queryset(self):
        """Filter sources of data to return only Cerema sources and MAJIC dataset."""
        return DataSource.objects.filter(
            productor=DataSource.ProductorChoices.CEREMA,
            dataset=DataSource.DatasetChoices.MAJIC,
        )

    def handle(self, *args, **options):
        logger.info("Start load_cerema")

        sources = self.get_queryset()

        if options.get("official_land_ids"):
            logger.info("filter on official_land_ids=%s", options["official_land_ids"])
            sources = sources.filter(official_land_id__in=options["official_land_ids"])

        if not sources.exists():
            logger.warning("No data source found")
            return

        logger.info("Nb sources found=%d", sources.count())

        for source in sources:
            factory = CeremaFactory(source)
            layer_mapper_proxy_class = factory.get_layer_mapper_proxy_class(module_name=__name__)
            logger.info("Process %s", layer_mapper_proxy_class.__name__)
            layer_mapper_proxy_class.load()

        logger.info("End load_cerema")
