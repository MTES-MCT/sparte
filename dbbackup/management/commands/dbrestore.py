import logging
import re
import subprocess

from django.conf import settings
from django.core.management.base import BaseCommand

from dbbackup.storages import DatabaseStorage


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Restore a database dump from django-storage/dbbackup"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dumpname",
            "-d",
            type=str,
            help="filename of the dump",
        )

    def handle(self, *args, **options):
        logger.info("Start restoring database")
        filename = options["class"]
        storage = DatabaseStorage()
        if not storage.exists(filename):
            raise FileNotFoundError(f"filename: {filename}")
        file = storage.open(filename)
        cmd = (
            "psql"
            " --dbname=postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{NAME}"
            " --set ON_ERROR_STOP=on"
            " --single-transaction"
            " {NAME}"
        ).format(**settings.DATABASES["default"])
        logger.info("Cmd: %s", re.sub(r":[^:]+@", ":*******@", cmd))
        cmd = cmd.split()
        subprocess.run(cmd, stdin=file, text=True)
        logger.info("End restore")
