import logging

from django.contrib.gis.db.models import Union
from django.contrib.gis.db.models.functions import Area, Intersection, MakeValid
from django.core.management.base import BaseCommand
from django.db.models import Q, Sum

from public_data.models import ArtificialArea, Commune, Departement, Ocsge, Region
from utils.db import DynamicSRIDTransform, fix_poly

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Build all data of cities"

    def add_arguments(self, parser):
        parser.add_argument(
            "--insee",
            type=str,
            help="insee code of a particular city",
        )
        parser.add_argument(
            "--departement",
            type=str,
            help="name of a departement",
        )
        parser.add_argument(
            "--region",
            type=str,
            help="name of region",
        )
        parser.add_argument(
            "--verbose",
            action="store_true",
            help="insee code of a particular city",
        )

    def handle(self, *args, **options):
        logger.info("Start build artificial area")
        self.verbose = options["verbose"]
        if options["insee"]:
            self.process_one(options["insee"])
        elif options["departement"]:
            self.process_departement(options["departement"])
        elif options["region"]:
            self.process_region(options["region"])
        else:
            self.process_all()
        logger.info("End build artificial area")

    def process_all(self):
        logger.info("Processing all cities")
        qs = Commune.objects.all().order_by("insee")
        self.process(qs)

    def process_departement(self, departement):
        qs = Departement.objects.filter(Q(source_id=departement) | Q(name__icontains=departement))
        if not qs.exists():
            logger.warning("No departement found")
            return
        departement = qs.first()
        logger.info("Departement: %s (%s)", departement.name, departement.source_id)
        self.process(departement.commune_set.all().order_by("insee"))

    def process_one(self, insee):
        logger.info("Processing one city with code insee= %s", insee)
        qs = Commune.objects.filter(insee=insee)
        if not qs.exists():
            logger.warning("Code insee unknown")
            return
        self.process(qs[:1])

    def process_region(self, region_name):
        logger.info("Processing a region with name= %s", region_name)
        qs = Region.objects.filter(Q(source_id=region_name) | Q(name__icontains=region_name))
        if not qs.exists():
            logger.warning("No region found")
            return
        region = qs.first()
        logger.info("Région: %s (%s)", region.name, region.source_id)
        self.process(region.get_cities().order_by("insee"))

    def process(self, queryset):
        total = queryset.count()
        logger.info("Total cities : %d", total)
        self.clean(queryset)
        for i, city in enumerate(queryset):
            self.build(city)
            if self.verbose:
                logger.info("%d/%d - %s (%s)", i + 1, total, city.name, city.insee)

    def build(self, city):
        qs = Ocsge.objects.filter(
            mpoly__intersects=city.mpoly,
            is_artificial=True,
            departement_id=city.departement_id,
        )
        if not qs.exists():
            return

        qs = (
            qs.annotate(intersection=Intersection(MakeValid("mpoly"), city.mpoly))
            .annotate(intersection_area=Area(DynamicSRIDTransform("intersection", "srid_source")))
            .values("year")
            .annotate(geom=MakeValid(Union("intersection")), surface=Sum("intersection_area"))
        )

        ArtificialArea.objects.bulk_create(
            [
                ArtificialArea(
                    city=city,
                    year=result["year"],
                    mpoly=fix_poly(result["geom"]),
                    surface=result["surface"].sq_m / 10000,
                )
                for result in qs
            ]
        )

    def clean(self, qs):
        logger.info("Delete previous artificial areas")
        ArtificialArea.objects.filter(city__in=qs).delete()
