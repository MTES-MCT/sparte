import logging

from django.core.management.base import BaseCommand

from trajectory.models import Trajectory

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Migrate trajectory if required"

    def handle(self, *args, **options):
        logger.info("Migrate trajectory")
        for i, trajectory in enumerate(Trajectory.objects.all()):
            new_data = {y: v for y, v in trajectory.data.items() if int(y) >= 2021}
            if new_data != trajectory.data:
                trajectory.data = new_data
                # trajectory.save()
                print("found one")
            print(i)
        logger.info("End migrate trajectory")
