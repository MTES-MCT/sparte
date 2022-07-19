import csv
import logging
import re

from django.core.management.base import BaseCommand

from public_data.models import CouvertureSol, UsageSol


logger = logging.getLogger("management.commands")


def build_short_label(label):
    label_short = re.sub(r"\(.*\)", "", label).strip()

    if len(label_short) < 30:
        return label_short
    else:
        return f"{label_short[:30]}..."


class Command(BaseCommand):
    help = "Load CSV of Usage and Couverture referential"

    def handle(self, *args, **options):
        logger.info("Start uploading CSV usage and couverture")
        self.load_couverture()
        self.load_usage()
        logger.info("End uploading CSV usage and couverture")

    def load_couverture(self):
        self.load(CouvertureSol, "public_data/static/CouvertureSol-2022-04-26.csv")

    def load_usage(self):
        self.load(UsageSol, "public_data/static/UsageSol-2022-04-26.csv")

    def load(self, Klass, file_path):
        parenting = dict()
        with open(file_path) as csvfile:
            spamreader = csv.reader(csvfile, delimiter=",")
            # 1. load all data without parent. Build a referential with file id => bd id
            for row in spamreader:
                if row[0] == "id":
                    continue
                try:
                    couv = Klass.objects.get(code=row[2])
                except Klass.DoesNotExist:
                    couv = Klass(code=row[2], code_prefix=row[1])
                couv.label = row[3].replace(";", ",")
                couv.label_short = build_short_label(couv.label)
                couv.map_color = row[4]
                couv.parent = None
                couv.save()
                parenting.update({row[0]: couv.id})
            # 2. update parent_id
            csvfile.seek(0)
            spamreader = csv.reader(csvfile, delimiter=",")
            for row in spamreader:
                if row[5] and row[0] != "id":
                    parent_id = parenting[row[5]]
                    Klass.objects.filter(code=row[2]).update(parent_id=parent_id)
