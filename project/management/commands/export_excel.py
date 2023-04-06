import calendar
import logging
from datetime import date, datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from project.models.export import export_dl_diag
from project.storages import ExportStorage

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = ""

    def add_arguments(self, parser):
        parser.add_argument("--local", action="store_true")
        parser.add_argument(
            "--start",
            type=lambda s: date.fromisoformat(s),
        )
        parser.add_argument(
            "--end",
            type=lambda s: date.fromisoformat(s),
        )

    def handle(self, *args, **options):
        logger.info("Start export stats")
        if options["start"]:
            start = options["start"]
        else:
            n = date.today()
            start = date(day=1, month=n.month, year=n.year)
        if options["end"]:
            end = options["end"]
        else:
            _, last_day = calendar.monthrange(year=start.year, month=start.month)
            end = date(day=last_day, month=start.month, year=start.year)

        if not isinstance(start, datetime):
            start = datetime(start.year, start.month, start.day)
        if not isinstance(end, datetime):
            end = datetime(end.year, end.month, end.day)
        start = timezone.make_aware(start)
        end = timezone.make_aware(end)
        logger.info("Start: %s", start)
        logger.info("End: %s", end)

        excel_file = export_dl_diag(start, end)
        filename = f"diag_downloaded_{start.strftime('%d%m%Y')}_{end.strftime('%d%m%Y')}.xlsx"
        if options["local"]:
            with open(filename, "wb") as f:
                f.write(excel_file.read())
        else:
            storage = ExportStorage()
            path = storage.save_xlsx(filename, excel_file)
            print(f"Url to file: {storage.url(path)}")
