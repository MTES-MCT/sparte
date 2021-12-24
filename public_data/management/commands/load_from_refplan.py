import logging

from django.contrib.gis.db.models import Union
from django.contrib.gis.geos import Polygon, MultiPolygon
from django.core.management.base import BaseCommand

from public_data.models import RefPlan, Region, Departement, Epci


logger = logging.getLogger(__name__)


def fix_poly(field):
    if isinstance(field, Polygon):
        return MultiPolygon(field)
    elif isinstance(field, MultiPolygon):
        return field
    else:
        raise TypeError("Field n'est ni un Polygon ni un MultiPolygon")


class Command(BaseCommand):
    help = "Will load data into Region, Departement and Epci from RefPlan data"

    def handle(self, *args, **options):
        logger.info("Recreate region, departement and EPCI referentials")
        self.load_region()
        self.load_departement()
        self.load_epci()
        self.link_epci_with_dept()

    def load_region(self):
        logger.info("Loading regions")
        Region.objects.all().delete()
        qs = RefPlan.objects.values("region_id", "region_name")
        qs = qs.annotate(mpoly=Union("mpoly")).order_by("region_name")
        logger.info("%d found regions", len(qs))
        items = [
            Region(
                source_id=refplan["region_id"],
                name=refplan["region_name"],
                mpoly=fix_poly(refplan["mpoly"]),
            )
            for refplan in qs
        ]
        Region.objects.bulk_create(items)
        logger.info("Done loading regions")

    def load_departement(self):
        logger.info("Loading departements")
        Departement.objects.all().delete()
        # preload Region referentiel to fill foreignkey easily
        regions = {r.source_id: r for r in Region.objects.all()}
        qs = RefPlan.objects.values("region_id", "dept_id", "dept_name")
        qs = qs.annotate(mpoly=Union("mpoly")).order_by("dept_id")
        logger.info("%d departements found", len(qs))
        items = [
            Departement(
                source_id=refplan["dept_id"],
                region=regions[refplan["region_id"]],
                name=refplan["dept_name"],
                mpoly=fix_poly(refplan["mpoly"]),
            )
            for refplan in qs
        ]
        Departement.objects.bulk_create(items)
        logger.info("Done loading departements")

    def load_epci(cls):
        logger.info("Loading EPCI")
        Epci.objects.all().delete()
        qs = RefPlan.objects.values("epci_id", "epci_name")
        qs = qs.annotate(mpoly=Union("mpoly")).order_by("epci_id")
        logger.info("%d EPCI found", len(qs))
        items = [
            Epci(
                source_id=refplan["epci_id"],
                name=refplan["epci_name"],
                mpoly=fix_poly(refplan["mpoly"]),
            )
            for refplan in qs
        ]
        Epci.objects.bulk_create(items)
        logger.info("Done loading EPCI")

    def link_epci_with_dept(self):
        logger.info("Link EPCI <-> département")
        depts = {d.source_id: d for d in Departement.objects.all()}
        epcis = {e.source_id: e for e in Epci.objects.all()}
        for epci in epcis.values():
            epci.departement.remove()
        links = RefPlan.objects.values_list("epci_id", "dept_id").distinct()
        logger.info("%d links found", links.count())
        for epci_id, dept_id in links:
            epcis[epci_id].departement.add(depts[dept_id])
        logger.info("Done linking")
