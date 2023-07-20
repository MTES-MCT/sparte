import logging

from django.core.management.base import BaseCommand
from django.db.models import Q
from functools import reduce

from trajectory.models import Trajectory

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Migrate trajectory if required"

    def handle(self, *args, **options):
        logger.info("Migrate trajectory")
        q_combined = reduce(lambda q1, q2: q1 | q2, [Q(data__has_key=str(y)) for y in range(2000, 2021)])
        qs = Trajectory.objects.filter(q_combined)
        for i, trajectory in enumerate(qs):
            new_data = {y: v for y, v in trajectory.data.items() if int(y) >= 2021}
            if new_data != trajectory.data:
                trajectory.data = new_data
                # trajectory.save()
                print("found one")
            print(i)
        logger.info("End migrate trajectory")
