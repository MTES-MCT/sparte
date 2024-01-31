import logging
from typing import Callable, Dict, Tuple

from django.core.management.base import BaseCommand
from django.db.models import Q

from public_data.factories import LayerMapperFactory
from public_data.models import DataSource, Departement, ocsge

logger = logging.getLogger("management.commands")


class OcsgeFactory(LayerMapperFactory):
    def get_class_properties(self, module_name: str) -> Dict[str, int]:
        properties = super().get_class_properties(module_name)
        properties |= {"_departement": Departement.objects.get(source_id=self.data_source.official_land_id)}
        if self.data_source.name == DataSource.DataNameChoices.DIFFERENCE:
            properties |= {
                "_year_old": min(self.data_source.millesimes),
                "_year_new": max(self.data_source.millesimes),
            }
        else:
            properties |= {"_year": self.data_source.millesimes[0]}
        return properties

    def get_base_class(self) -> Tuple[Callable]:
        base_class = None
        if self.data_source.name == DataSource.DataNameChoices.DIFFERENCE:
            base_class = ocsge.AutoOcsgeDiff
        elif self.data_source.name == DataSource.DataNameChoices.OCCUPATION_DU_SOL:
            base_class = ocsge.AutoOcsge
        elif self.data_source.name == DataSource.DataNameChoices.ZONE_CONSTRUITE:
            base_class = ocsge.AutoZoneConstruite
        return (base_class,)


class Command(BaseCommand):
    def get_queryset(self):
        return DataSource.objects.filter(
            productor=DataSource.ProductorChoices.IGN,
            dataset=DataSource.DatasetChoices.OCSGE,
        )

    def add_arguments(self, parser):
        parser.add_argument(
            "--departement",
            type=str,
            help="Departement name",
        )
        parser.add_argument(
            "--year-range",
            type=str,
            help="Year range",
        )
        parser.add_argument(
            "--layer-type",
            type=str,
            help="Layer type.",
        )
        parser.add_argument(
            "--all",
            action="store_true",
            help="Load all data",
        )

        parser.add_argument(
            "--list",
            action="store_true",
            help="List available data",
        )

    def handle(self, *args, **options):
        if not options:
            raise ValueError("You must provide at least one option, or use --all to load all data")

        if options.get("list"):
            for source in self.get_queryset():
                print(source)
            return

        sources = self.get_queryset()

        if options.get("departement"):
            departement_param = options.get("departement")
            departement_queryset = Departement.objects.filter(
                Q(source_id=departement_param) | Q(name__icontains=departement_param)
            )

            if not departement_queryset:
                raise ValueError(f"{departement_param} is not a valid departement")

            departement = departement_queryset.first()

            sources = sources.filter(official_land_id=departement.source_id)

        if options.get("year-range"):
            year_range = options.get("year-range").split(",")
            sources = sources.filter(millesimes__overlap=year_range)

        if options.get("layer-type"):
            sources = sources.filter(name__icontains=options.get("layer-type"))

        if not sources:
            raise ValueError("No data sources found")

        for source in sources:
            layer_mapper_proxy_class = OcsgeFactory(source).get_layer_mapper_proxy_class(module_name=__name__)
            logger.info("Process %s", layer_mapper_proxy_class.__name__)
            layer_mapper_proxy_class.load()
