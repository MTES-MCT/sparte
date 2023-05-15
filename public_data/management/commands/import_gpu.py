import base64
import logging

from django.contrib.gis.geos import GEOSGeometry
from django.core.management.base import BaseCommand
from django.db.models import Q

from public_data.models import ZoneUrba2 as ZoneUrba, Departement
from public_data.storages import DataStorage


logger = logging.getLogger("management.commands")


def from_b64_to_str(base64_unicode):
    base64_bytes = base64_unicode.encode("utf-8")
    str_bytes = base64.b64decode(base64_bytes)
    return str_bytes.decode("utf-8")


class Command(BaseCommand):
    help = "Load all data from OCS GE"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dept",
            type=str,
            help="departement you want to export",
        )

    def handle(self, *args, **options):
        logger.info("Import GPU from S3")

        dept_param = options["dept"]
        qs = Departement.objects.filter(Q(source_id=dept_param) | Q(name=dept_param))
        if not dept_param or not qs.exists():
            raise ValueError("You must provide a valid departement")
        dept = qs.first()
        logger.info("Departement selected: %s", dept.name)

        filename = f"GPU/{dept.source_id}_{dept.name}.csv"
        storage = DataStorage()
        if not storage.exists(filename):
            raise ValueError("File does not exist, have you exported it first ?")

        logger.info("Delete previous data from this departement")
        ZoneUrba.objects.intersect(dept.mpoly).delete()

        logger.info("Read data from file")
        s3_file = storage.open(filename, "r")
        field_names = [
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
            "mpoly",
        ]
        zones = []
        for i, line in enumerate(s3_file):
            if i == 0:
                continue
            line_b64 = line.strip()[1:-1].split('";"')
            line_data = list(map(from_b64_to_str, line_b64))
            line_dict = dict(zip(field_names[:-1], line_data[:-1]))
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

        logger.info("End importing GPU")
