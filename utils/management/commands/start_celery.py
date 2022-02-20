import shlex
import subprocess

from django.core.management.base import BaseCommand
from django.utils import autoreload


def restart_celery():
    cmd = "pkill celery"
    subprocess.call(shlex.split(cmd))
    cmd = "celery -A config.celery worker --loglevel=info"
    subprocess.call(shlex.split(cmd))


class Command(BaseCommand):
    def handle(self, *args, **options):
        print("Starting celery worker with autoreload...")

        # For Django>=2.2
        autoreload.run_with_reloader(restart_celery)
