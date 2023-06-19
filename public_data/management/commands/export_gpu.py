import base64
import codecs
import csv
import io
import logging

from django.core.management.base import BaseCommand
from django.db.models import Q

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
    "mpoly",
]


def to_b64_utf8(words: str) -> str:
    if words:
        words = str(words)
        return base64.b64encode(words.encode("utf-8")).decode("utf-8")
    return ""


class Command(BaseCommand):
    help = "Load all data from OCS GE"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dept",
            type=str,
            help="departement you want to export",
        )

    def handle(self, *args, **options):
        logger.info("Export GPU to csv on s3")

        self.storage = DataStorage()
        self.storage.file_overwrite = True

        qs = Departement.objects.all().order_by("name")

        dept_param = options["dept"]
        if dept_param:
            qs = Departement.objects.filter(Q(source_id=dept_param) | Q(name=dept_param))
            if not qs.exists():
                raise ValueError(f"{dept_param} is not a valid departement")

        logger.info("Total departement to process: %d", qs.count())

        for dept in qs:
            self.process_one(dept)

        logger.info("End exporting GPU")

    def process_one(self, dept: Departement) -> None:
        logger.info("Departement processed: %s", dept.name)

        bcontent = io.BytesIO()
        StreamWriter = codecs.getwriter('utf-8')
        stream = StreamWriter(bcontent)
        writer = csv.writer(stream, delimiter=";", quotechar='"', quoting=csv.QUOTE_ALL)

        writer.writerow(FIELD_NAMES)

        qs = ZoneUrba.objects.intersect(dept.mpoly)
        total = qs.count()
        logger.info("Exporting %d zones", total)
        for row in qs.values_list(*FIELD_NAMES):
            writer.writerow(map(to_b64_utf8, row))

        filename = f"GPU/{dept.source_id}_{dept.name}.csv"
        bcontent.seek(0)
        logger.info("Writing file to S3")

        final_name = self.storage.save(filename, bcontent)
        logger.info("File created: %s", final_name)
