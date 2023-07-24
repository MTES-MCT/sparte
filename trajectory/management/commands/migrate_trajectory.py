import logging

from django.core.management.base import BaseCommand

from trajectory.models import Trajectory

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Migrate trajectory if required"

    def handle(self, *args, **options):
        logger.info("Migrate trajectory")
        qs = Trajectory.objects.all()
        total = qs.count()
        for i, trajectory in enumerate(qs):
            trajectory.data = {y: {"value": v, "updated": False} for y, v in trajectory.data.items() if int(y) >= 2021}
            trajectory.save()
            if i % 100 == 0:
                print(f"{i}/{total}")
        logger.info("End migrate trajectory")
