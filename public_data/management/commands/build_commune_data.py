import logging

from django.core.management.base import BaseCommand
from django.db.models import F, Q

from public_data.models import (
    Commune,
    CommuneDiff,
    CommuneSol,
    Departement,
    Ocsge,
    OcsgeDiff,
    Region,
)
from utils.db import cast_sum_area

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

    def __calculate_surface_artif(self, city: Commune):
        city.surface_artif = (
            Ocsge.objects.intersect(city.mpoly)
            .filter(
                is_artificial=True,
                year=city.last_millesime,
                departement_id=city.departement_id,
            )
            .aggregate(surface_artif=cast_sum_area("intersection_area"))["surface_artif"]
        )

    def __set_ocsge_availability(self, city: Commune) -> bool:
        city.ocsge_available = bool(city.departement.ocsge_millesimes)

    def __set_ocsge_first_and_last_millesime(self, city: Commune) -> None:
        city.last_millesime = max(city.departement.ocsge_millesimes)
        city.first_millesime = min(city.departement.ocsge_millesimes)

    def build_data(self, city: Commune):
        self.__set_ocsge_availability(city)

        if not city.ocsge_available:
            city.save()
            return

        self.__set_ocsge_first_and_last_millesime(city)
        self.__calculate_surface_artif(city)

        city.save()

        self.build_commune_sol(city)
        self.build_commune_diff(city)

    def build_commune_sol(self, city: Commune):
        CommuneSol.objects.filter(city=city).delete()
        qs = (
            Ocsge.objects.intersect(city.mpoly)
            .filter(departement_id=city.departement_id)
            .exclude(matrix=None)
            .values("matrix_id", "year")
            .annotate(surface=cast_sum_area("intersection_area"))
        )
        CommuneSol.objects.bulk_create([CommuneSol(city=city, **_) for _ in qs])

    def build_commune_diff(self, city):
        CommuneDiff.objects.filter(city=city).delete()
        qs = (
            OcsgeDiff.objects.intersect(city.mpoly)
            .filter(departement_id=city.departement_id)
            .values("year_old", "year_new")
            .annotate(
                new_artif=cast_sum_area("intersection_area", filter=Q(is_new_artif=True)),
                new_natural=cast_sum_area("intersection_area", filter=Q(is_new_natural=True)),
                net_artif=F("new_artif") - F("new_natural"),
            )
        )

        CommuneDiff.objects.bulk_create([CommuneDiff(city=city, **_) for _ in qs])
