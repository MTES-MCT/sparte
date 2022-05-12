import logging

from django.contrib.gis.db.models.functions import Intersection, Area, Transform
from django.core.management.base import BaseCommand
from django.db.models import Sum, Q

from public_data.models import (
    Commune,
    CommuneDiff,
    CommuneSol,
    Departement,
    Ocsge,
    # Departement,
    OcsgeDiff,
    # ZoneConstruite,
    # CouvertureUsageMatrix,
)


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
            help="insee code of a particular city",
        )

    def handle(self, *args, **options):
        logger.info("Start build cities data")
        if options["insee"]:
            self.process_one(options["insee"])
        elif options["departement"]:
            self.process_departement(options["departement"])
        else:
            self.process_all()
        logger.info("End building cities data")

    def process_multi(self, queryset):
        total = queryset.count()
        logger.info("Total cities : %d", total)
        for i, city in enumerate(queryset):
            self.build_data(city)
            logger.info("%d/%d - %s (%s)", i + 1, total, city.name, city.insee)

    def process_all(self):
        logger.info("Processing all cities")
        qs = Commune.objects.all().order_by("insee")
        self.process_multi(qs)

    def process_departement(self, departement):
        qs = Departement.objects.filter(
            Q(source_id=departement) | Q(name__icontains=departement)
        )
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
        qs = Ocsge.objects.filter(mpoly__intersects=city.mpoly)
        # find most recent millesime
        try:
            ocsge = qs.latest("year")
        except Ocsge.DoesNotExist:
            # nothing to calculate
            return
        city.last_millesime = ocsge.year
        qs = qs.filter(year=ocsge.year, is_artificial=True)
        result = qs.aggregate(Sum("surface"))
        city.surface_artif = 0
        if result["surface__sum"]:
            city.surface_artif = result["surface__sum"] / 10000
        city.save()

        # Prep data for couverture and usage in CommuneSol
        # clean data first
        CommuneSol.objects.filter(city=city).delete()
        qs = Ocsge.objects.filter(mpoly__intersects=city.mpoly)
        qs = qs.exclude(matrix=None)
        qs = qs.annotate(intersection=Intersection("mpoly", city.mpoly))
        qs = qs.annotate(intersection_area=Area(Transform("intersection", 2154)))
        qs = qs.values("matrix", "year")
        qs = qs.annotate(surface=Sum("intersection_area"))
        CommuneSol.objects.bulk_create(
            [
                CommuneSol(
                    city=city,
                    year=result["year"],
                    matrix_id=result["matrix"],
                    surface=result["surface"].sq_m / 10000,
                )
                for result in qs
            ]
        )

        # prep data for artif report in CommuneDiff
        qs = OcsgeDiff.objects.filter(mpoly__intersects=city.mpoly)
        qs = qs.annotate(intersection=Intersection("mpoly", city.mpoly))
        qs = qs.annotate(intersection_area=Area(Transform("intersection", 2154)))
        qs = qs.values("year_old", "year_new")
        qs = qs.annotate(
            new_artif=Sum("intersection_area", filter=Q(is_new_artif=True))
        )
        qs = qs.annotate(
            new_natural=Sum("intersection_area", filter=Q(is_new_natural=True))
        )

        for result in qs:
            try:
                # try to fetch the line if exists
                city_data = CommuneDiff.objects.get(
                    city=city, year_old=result["year_old"], year_new=result["year_new"]
                )
            except CommuneDiff.DoesNotExist:
                city_data = CommuneDiff(
                    city=city, year_old=result["year_old"], year_new=result["year_new"]
                )
            city_data.new_artif = city_data.new_natural = 0
            if result["new_artif"]:
                city_data.new_artif = result["new_artif"].sq_m / 10000
            if result["new_natural"]:
                city_data.new_natural = result["new_natural"].sq_m / 10000
            city_data.net_artif = city_data.new_artif - city_data.new_natural
            city_data.save()
