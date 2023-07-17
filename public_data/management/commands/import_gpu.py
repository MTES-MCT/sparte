import base64
import logging

from django.contrib.gis.geos import GEOSGeometry
from django.core.management.base import BaseCommand
from django.db.models import Q

from public_data.management.commands.load_gpu import ZoneUrbaFrance
from public_data.models import Departement, ZoneUrba
from public_data.storages import DataStorage

logger = logging.getLogger("management.commands")


FIELD_NAMES = [
    "gid",
    "libelle",
    "libelong",
    "typezone",
    "insee",
    "idurba",
    "idzone",
    "lib_idzone",
    "partition",
    "destdomi",
    "nomfic",
    "urlfic",
    "datappro",
    "datvalid",
    # "mpoly",
]


def from_b64_to_str(base64_unicode):
    base64_bytes = base64_unicode.encode("utf-8")
    str_bytes = base64.b64decode(base64_bytes)
    return str_bytes.decode("utf-8")


class MissingFile(Exception):
    pass


class Command(BaseCommand):
    help = "Use file on S3 to import GPU data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dept",
            type=str,
            help="departement you want to export",
        )

    def handle(self, *args, **options):
        logger.info("Import GPU from S3")

        self.storage = DataStorage()

        qs = Departement.objects.all().order_by("name")

        dept_param = options["dept"]
        if dept_param:
            qs = qs.filter(Q(source_id=dept_param) | Q(name=dept_param))
            if not qs.exists():
                raise ValueError(f"{dept_param} is not a valid departement")

        for dept in qs:
            try:
                self.process_one(dept)
            except MissingFile:
                logger.warning("Missing file for departement %s", dept.name)

        logger.info("End importing GPU")

    def process_one(self, dept: Departement) -> None:
        logger.info("Departement processed: %s", dept.name)

        filename = f"GPU/{dept.source_id}_{dept.name}.csv"
        if not self.storage.exists(filename):
            raise MissingFile("File does not exist, have you exported it first ?")

        logger.info("Delete previous data from this departement")
        zones = ZoneUrba.objects.intersect(dept.mpoly)
        zones.delete()

        logger.info("Read data from file")
        s3_file = self.storage.open(filename, "r")

        zones = []
        for i, line in enumerate(s3_file):
            if i == 0:
                continue
            line_b64 = line.strip()[1:-1].split('";"')
            line_data = list(map(from_b64_to_str, line_b64))
            line_dict = dict(zip(FIELD_NAMES, line_data[:-1]))
            try:
                line_dict["mpoly"] = GEOSGeometry(line_data[-1])
            except ValueError as exc:
                logger.error("Error while parsing geometry: %s", exc)
                logger.error("line: %s", line)
                logger.error("line_b64: %s", line_b64)
                logger.error("line_data: %s", line_data)
                logger.error("line_dict: %s", line_dict)
                raise exc
            zones.append(ZoneUrba(**line_dict))
            if i % 1000 == 0:
                logger.info("Bulk create 1000 lines.")
                ZoneUrba.objects.bulk_create(zones)
                zones = []
        ZoneUrba.objects.bulk_create(zones)
        logger.info("Imported %i lines", i)

        logger.info("Start calculating fields")
        ZoneUrbaFrance.calculate_fields()
