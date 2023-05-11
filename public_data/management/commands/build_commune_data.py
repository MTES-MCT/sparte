import logging

from django.core.management.base import BaseCommand
from django.db.models import F, Q

from public_data.models import (
    Commune,
    CommuneDiff,
    CommuneSol,
    Region,
    Departement,
    Ocsge,
    OcsgeDiff,
    Region,
)
from utils.db import cast_sum

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
            help="name of a specific departement",
        )
        parser.add_argument(
            "--region",
            type=str,
            help="name of region",
        )
        parser.add_argument(
            "--verbose",
            action="store_true",
            help="display city processed",
        )

    def handle(self, *args, **options):
        logger.info("Start build cities data")
        self.verbose = options["verbose"]
        if options["insee"]:
            self.process_one(options["insee"])
        elif options["departement"]:
            self.process_departement(options["departement"])
        elif options["region"]:
            self.process_departement(options["region"])
        else:
            self.process_all()
        logger.info("End building cities data")

    def process_multi(self, queryset):
        total = queryset.count()
        logger.info("Total cities : %d", total)
        for i, city in enumerate(queryset):
            self.build_data(city)
            if self.verbose:
                logger.info("%d/%d - %s (%s)", i + 1, total, city.name, city.insee)

    def process_all(self):
        logger.info("Processing all cities")
        qs = Commune.objects.all().order_by("insee")
        self.process_multi(qs)

    def process_region(self, region_name):
        logger.info("Processing a region with name= %s", region_name)
        qs = Region.objects.filter(Q(source_id=region_name) | Q(name__icontains=region_name))
        if not qs.exists():
            logger.warning("No region found")
            return
        region = qs.first()
        logger.info("Région: %s (%s)", region.name, region.source_id)
        self.process_multi(region.get_cities().order_by("name"))

    def process_departement(self, departement):
        qs = Departement.objects.filter(Q(source_id=departement) | Q(name__icontains=departement))
        if not qs.exists():
            logger.warning("No departement found")
            return
        departement = qs.first()
        logger.info("Departement: %s (%s)", departement.name, departement.source_id)
        self.process_multi(departement.commune_set.all().order_by("name"))

    def process_one(self, insee):
        logger.info("Processing one city with code insee= %s", insee)
        qs = Commune.objects.filter(insee=insee)
        if not qs.exists():
            logger.warning("Code insee unknown")
            return
        elif qs.count() > 1:
            logger.warning("More than 1 city fetched, should'nt be possible -_-'")
            return
        city = qs.first()
        self.build_data(city)

    def build_data(self, city):
        qs = Ocsge.objects.intersect(city.mpoly)
        # find most recent millesime
        try:
            ocsge = qs.latest("year")
        except Ocsge.DoesNotExist:
            # nothing to calculate
            return
        city.last_millesime = ocsge.year
        qs = qs.filter(year=ocsge.year, is_artificial=True)
        result = qs.aggregate(surface_artif=cast_sum("intersection_area"))
        city.surface_artif = result["surface_artif"]
        city.save()
        self.build_commune_sol(city)
        self.build_commune_diff(city)

    def build_commune_sol(self, city):
        # Prep data for couverture and usage in CommuneSol
        # clean data first
        CommuneSol.objects.filter(city=city).delete()
        qs = Ocsge.objects.intersect(city.mpoly)
        qs = qs.exclude(matrix=None)
        qs = qs.values("matrix_id", "year")
        qs = qs.annotate(surface=cast_sum("intersection_area"))
        CommuneSol.objects.bulk_create([CommuneSol(city=city, **_) for _ in qs])

    def build_commune_diff(self, city):
        # prep data for artif report in CommuneDiff
        qs = OcsgeDiff.objects.intersect(city.mpoly)
        qs = qs.values("year_old", "year_new")
        qs = qs.annotate(
            new_artif=cast_sum("intersection_area", filter=Q(is_new_artif=True)),
            new_natural=cast_sum("intersection_area", filter=Q(is_new_natural=True)),
            net_artif=F("new_artif") - F("new_natural"),
        )

        for result in qs:
            try:
                # try to fetch the line if exists
                city_data = CommuneDiff.objects.get(
                    city=city,
                    year_old=result["year_old"],
                    year_new=result["year_new"],
                )
                city_data.new_artif = result["new_artif"]
                city_data.new_natural = result["new_natural"]
                city_data.net_artif = result["net_artif"]
                city_data.save()
            except CommuneDiff.DoesNotExist:
                city_data = CommuneDiff.objects.create(city=city, **result)
