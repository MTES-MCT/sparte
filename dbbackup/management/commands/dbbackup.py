from datetime import datetime
from io import BytesIO
import logging
import re
import subprocess

from django.conf import settings
from django.core.management.base import BaseCommand

from dbbackup.storages import DatabaseStorage


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Create a dump of the database and sent it in django-storage"

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        """
        PostgreSQL connector, it uses pg_dump`` to create an SQL text file
        and ``psql`` for restore it.
        restore_cmd = 'psql'
        """
        logger.info("Start backuping database")
        cmd = (
            "pg_dump --dbname=postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{NAME}"
        ).format(**settings.DATABASES["default"])
        logger.info("Cmd: %s", re.sub(r":[^:]+@", ":*******@", cmd))
        cmd = cmd.split()
        try:
            content = subprocess.run(cmd, stdout=subprocess.PIPE, text=True)
            data = content.stdout
        except FileNotFoundError:
            data = BytesIO(b"local test")
        storage = DatabaseStorage()
        filename = "{}_{}_backup.sql.gz".format(
            datetime.now().strftime("%Y%m%d%H%M%S"),
            settings.DATABASES["default"]["NAME"],
        )
        filename = storage.generate_filename(filename)
        storage.save(filename, data)
        logger.info("End backup")
