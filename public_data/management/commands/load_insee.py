import logging
import pandas as pd

from django.core.management.base import BaseCommand

from public_data.models import Commune, CommunePop
from public_data.models.mixins import TruncateTableMixin
from public_data.storages import DataStorage


logger = logging.getLogger("management.commands")


class TruncateComPop(TruncateTableMixin, CommunePop):
    class Meta:
        proxy = True


class Command(BaseCommand):
    help = "Charge les données de l'INSEE dans la BDD"

    def handle(self, *args, **options):
        logger.info("Start loading INSEE data")
        self.upload_pop()
        logger.info("End loading INSEE data")

    def upload_pop(self):
        logger.info("Load population from Excel file on S3")
        remote_file_path = "base-pop-historiques-1876-2019.xlsx"
        logger.info(f"file={remote_file_path}")
        file_stream = DataStorage().open(remote_file_path)
        # hook for testing
        file_stream = "notebooks/base-pop-historiques-1876-2019(1).xlsx"
        df = pd.DataFrame(pd.read_excel(file_stream))
        # file_stream.close()
        df.columns = df.T[4]
        df = df.iloc[5:, :18]
        logger.info("Delete previous data and reset id counter")
        TruncateComPop.truncate()
        todo = []
        for row in df.iterrows():
            items = row[1].tolist()
            try:
                city = Commune.objects.get(insee=items[0])
            except Commune.DoesNotExist:
                continue
            todo += [
                CommunePop(city=city, year=(2019 - i), pop=item)
                for i, item in enumerate(items[4:])
            ]
            if len(todo) >= 10000:
                logger.info(f"Save to bdd, INSEE so far {items[0]}")
                CommunePop.objects.bulk_create(todo)
                del todo
                todo = []
