import codecs
import csv
import io
import logging

from django.core.management.base import BaseCommand
from django.db.models import Q

from public_data.models import ZoneUrba, Departement
from public_data.storages import DataStorage


logger = logging.getLogger("management.commands")


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

        dept_param = options["dept"]
        qs = Departement.objects.filter(Q(source_id=dept_param) | Q(name=dept_param))
        if not dept_param or not qs.exists():
            raise ValueError("You must provide a valid departement")
        dept = qs.first()
        logger.info("Departement selected: %s", dept.name)

        bcontent = io.BytesIO()
        StreamWriter = codecs.getwriter('utf-8')
        stream = StreamWriter(bcontent)
        writer = csv.writer(stream, delimiter=";", quotechar='"', quoting=csv.QUOTE_ALL)

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
        writer.writerow(field_names)

        qs = ZoneUrba.objects.intersect(dept.mpoly)
        total = qs.count()
        logger.info("Exporting %d zones", total)
        for row in qs.values_list(*field_names):
            writer.writerow(row)

        filename = f"GPU/{dept.source_id}_{dept.name}.csv"
        # data = stream.getvalue().encode("utf-8")
        bcontent.seek(0)
        logger.info("Writing file to S3")
        final_name = DataStorage().save(filename, bcontent)
        logger.info("File created: %s", final_name)

        logger.info("End exporting GPU")
