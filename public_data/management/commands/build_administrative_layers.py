import logging

from django.contrib.gis.db.models import Union
from django.core.management.base import BaseCommand
from django.core.paginator import Paginator
from django.db.models import QuerySet

from public_data.models import Cerema, Commune, Departement, Epci, Region
from public_data.models.administration import Scot
from utils.db import fix_poly

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "(caution, it's from scratch) Will load data into Region, Departement and Epci from Cerema data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clean",
            action="store_true",
            help="Clean all data before loading",
        )

    def handle(self, *args, **options):
        clean = options.get("clean", False)

        logger.info("Recreate region, departement, EPCI and communes referentials")

        if clean:
            logger.info("Clean all data")
            Region.objects.all().delete()
            Departement.objects.all().delete()
            Epci.objects.all().delete()
            Commune.objects.all().delete()
            Scot.objects.all().delete()

        self.load_region()
        self.load_departement()
        self.load_epci()
        self.link_epci()
        self.load_communes(table_was_cleaned=clean)

    def load_region(self):
        logger.info("Loading regions")

        qs = Cerema.objects.values("region_id", "region_name", "srid_source")
        qs = qs.annotate(mpoly=Union("mpoly")).order_by("region_name")

        logger.info("%d found regions", len(qs))

        total_created = 0

        for data in qs:
            _, created = Region.objects.get_or_create(
                source_id=data["region_id"],
                defaults={
                    "name": data["region_name"],
                    "mpoly": fix_poly(data["mpoly"]),
                    "srid_source": data["srid_source"],
                },
            )

            if created:
                total_created += 1

        logger.info("%d regions created", total_created)
        logger.info("Done loading regions")

    def load_departement(self, base_qs: QuerySet):
        logger.info("Loading departements")

        regions = {r.source_id: r for r in Region.objects.all()}

        qs = Cerema.objects.values("region_id", "dept_id", "dept_name", "srid_source")
        qs = qs.annotate(mpoly=Union("mpoly")).order_by("dept_id")

        logger.info("%d departements found", len(qs))

        total_created = 0

        for data in qs:
            _, created = Departement.objects.get_or_create(
                source_id=data["dept_id"],
                defaults={
                    "region": regions[data["region_id"]],
                    "name": data["dept_name"],
                    "mpoly": fix_poly(data["mpoly"]),
                    "srid_source": data["srid_source"],
                },
            )

            if created:
                total_created += 1

        logger.info("%d departements created", total_created)
        logger.info("Done loading departements")

    def load_epci(self, base_qs: QuerySet):
        logger.info("Loading EPCI")

        qs = Cerema.objects.values("epci_id", "epci_name", "srid_source")
        qs = qs.annotate(mpoly=Union("mpoly")).order_by("epci_id")

        logger.info("%d EPCI found", len(qs))

        total_created = 0

        for data in qs:
            _, created = Epci.objects.get_or_create(
                source_id=data["epci_id"],
                defaults={
                    "name": data["epci_name"],
                    "mpoly": fix_poly(data["mpoly"]),
                    "srid_source": data["srid_source"],
                },
            )

            if created:
                total_created += 1

        logger.info("%d EPCI created", total_created)
        logger.info("Done loading EPCI")

    def load_scot(self, base_qs: QuerySet):
        logger.info("Loading SCOT")

        qs = Cerema.objects.values("scot", "srid_source")
        qs = qs.annotate(mpoly=Union("mpoly")).order_by("scot")

        logger.info("%d SCoTs found", len(qs))

        total_created = 0

        for data in qs:
            if data["scot"] is None:
                continue

            _, created = Scot.objects.get_or_create(
                name=data["scot"],
                defaults={
                    "mpoly": fix_poly(data["mpoly"]),
                },
            )

            if created:
                total_created += 1

        logger.info("%d SCoTs created", total_created)
        # link to region and departement
        depts = {d.source_id: d for d in Departement.objects.all()}
        regions = {r.source_id: r for r in Region.objects.all()}
        links = {}

        for scot_name, dept_id, region_id in (
            Cerema.objects.values_list("scot", "dept_id", "region_id")
            .order_by("scot")
            .filter(scot__isnull=False)
            .distinct()
        ):
            if scot_name not in links:
                links[scot_name] = {"departement_ids": set(), "region_ids": set()}

            links[scot_name]["departement_ids"].add(dept_id)
            links[scot_name]["region_ids"].add(region_id)

        for scot_name, data in links.items():
            scot = Scot.objects.get(name=scot_name)
            scot.departements.add(*[depts[d] for d in data["departement_ids"]])
            scot.regions.add(*[regions[r] for r in data["region_ids"]])

    def link_epci(self, base_qs: QuerySet):
        logger.info("Link EPCI <-> département")
        depts = {d.source_id: d for d in Departement.objects.all()}
        epcis = {e.source_id: e for e in Epci.objects.all()}
        for epci in epcis.values():
            epci.departements.remove()
        links = base_qs.values_list("epci_id", "dept_id").distinct()
        logger.info("%d links found", links.count())
        for epci_id, dept_id in links:
            epcis[epci_id].departements.add(depts[dept_id])
        logger.info("Done linking")

    def load_communes(self, table_was_cleaned: bool):
        logger.info("Loading Communes")
        depts = {d.source_id: d for d in Departement.objects.all()}
        epcis = {e.source_id: e for e in Epci.objects.all()}
        qs = Cerema.objects.all().order_by("city_insee")
        paginator = Paginator(qs, 1000)
        logger.info("%d Communes found in %d pages", paginator.count, paginator.num_pages)
        # TODO : fix
        for page in paginator.page_range:
            Commune.objects.bulk_create(
                (
                    Commune(
                        insee=data.city_insee,
                        name=data.city_name,
                        departement=depts[data.dept_id],
                        epci=epcis[data.epci_id],
                        mpoly=fix_poly(data.mpoly),
                        area=data.mpoly.transform(2154, clone=True).area / 10000,
                    )
                )
                logger.info("Page %d/%d done", page, paginator.num_pages)

            logger.info("Done loading Communes")
        else:
            total_created = 0

            for data in qs:
                _, created = Commune.objects.get_or_create(
                    insee=data.city_insee,
                    defaults={
                        "name": data.city_name,
                        "departement": depts[data.dept_id],
                        "epci": epcis[data.epci_id],
                        "mpoly": fix_poly(data.mpoly),
                        "srid_source": data.srid_source,
                    },
                )

                if created:
                    total_created += 1
                    if total_created % 10 == 0:
                        logger.info("%d Communes created", total_created)

            logger.info("%d Communes created", total_created)
