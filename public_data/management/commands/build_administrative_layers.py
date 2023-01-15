import logging

from django.contrib.gis.db.models import Union
from django.core.management.base import BaseCommand
from django.core.paginator import Paginator

from public_data.models import Cerema, Commune, Departement, Epci, Region
from utils.db import fix_poly

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Will load data into Region, Departement and Epci from Cerema data"

    def handle(self, *args, **options):
        logger.info("Recreate region, departement, EPCI and communes referentials")
        self.load_region()
        self.load_departement()
        self.load_epci()
        self.link_epci_with_dept()
        self.load_communes()

    def load_region(self):
        logger.info("Loading regions")
        Region.objects.all().delete()
        qs = Cerema.objects.values("region_id", "region_name")
        qs = qs.annotate(mpoly=Union("mpoly")).order_by("region_name")
        logger.info("%d found regions", len(qs))
        items = [
            Region(
                source_id=data["region_id"],
                name=data["region_name"],
                mpoly=fix_poly(data["mpoly"]),
            )
            for data in qs
        ]
        Region.objects.bulk_create(items)
        logger.info("Done loading regions")

    def load_departement(self):
        logger.info("Loading departements")
        Departement.objects.all().delete()
        # preload Region referentiel to fill foreignkey easily
        regions = {r.source_id: r for r in Region.objects.all()}
        qs = Cerema.objects.values("region_id", "dept_id", "dept_name")
        qs = qs.annotate(mpoly=Union("mpoly")).order_by("dept_id")
        logger.info("%d departements found", len(qs))
        items = [
            Departement(
                source_id=data["dept_id"],
                region=regions[data["region_id"]],
                name=data["dept_name"],
                mpoly=fix_poly(data["mpoly"]),
            )
            for data in qs
        ]
        Departement.objects.bulk_create(items)
        logger.info("Done loading departements")

    def load_epci(self):
        logger.info("Loading EPCI")
        Epci.objects.all().delete()
        qs = Cerema.objects.values("epci_id", "epci_name")
        qs = qs.annotate(mpoly=Union("mpoly")).order_by("epci_id")
        logger.info("%d EPCI found", len(qs))
        items = [
            Epci(
                source_id=data["epci_id"],
                name=data["epci_name"],
                mpoly=fix_poly(data["mpoly"]),
            )
            for data in qs
        ]
        Epci.objects.bulk_create(items)
        logger.info("Done loading EPCI")

    def link_epci_with_dept(self):
        logger.info("Link EPCI <-> département")
        depts = {d.source_id: d for d in Departement.objects.all()}
        epcis = {e.source_id: e for e in Epci.objects.all()}
        for epci in epcis.values():
            epci.departements.remove()
        links = Cerema.objects.values_list("epci_id", "dept_id").distinct()
        logger.info("%d links found", links.count())
        for epci_id, dept_id in links:
            epcis[epci_id].departements.add(depts[dept_id])
        logger.info("Done linking")

    def load_communes(self):
        logger.info("Loading Communes")
        Commune.objects.all().delete()
        depts = {d.source_id: d for d in Departement.objects.all()}
        epcis = {e.source_id: e for e in Epci.objects.all()}
        qs = Cerema.objects.all().order_by("city_insee")
        paginator = Paginator(qs, 1000)
        logger.info(
            "%d Communes found in %d pages", paginator.count, paginator.num_pages
        )
        for page in paginator.page_range:
            Commune.objects.bulk_create(
                (
                    Commune(
                        insee=data.city_insee,
                        name=data.city_name,
                        departement=depts[data.dept_id],
                        epci=epcis[data.epci_id],
                        mpoly=fix_poly(data.mpoly),
                    )
                    for data in paginator.page(page)
                )
            )
            logger.info("Page %d/%d done", page, paginator.num_pages)
        logger.info("Done loading Communes")
