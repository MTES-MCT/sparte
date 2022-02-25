import shlex
import subprocess  # nosec

from django.core.management.base import BaseCommand
from django.utils import autoreload


def restart_celery():
    # below subprocess calls can't be
    cmd = "pkill celery"
    subprocess.call(shlex.split(cmd))  # nosec
    cmd = "celery -A config.celery worker --loglevel=info"
    subprocess.call(shlex.split(cmd))  # nosec


class Command(BaseCommand):
    def handle(self, *args, **options):
        print("Starting celery worker with autoreload...")

        # For Django>=2.2
        autoreload.run_with_reloader(restart_celery)
