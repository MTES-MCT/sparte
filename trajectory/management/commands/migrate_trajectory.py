import logging

from django.core.management.base import BaseCommand

from trajectory.models import Trajectory

logger = logging.getLogger("management.commands")


def get_value(data) -> float:
    if isinstance(data, float) or isinstance(data, int):
        return data
    if isinstance(data, dict):
        return get_value(data.get("value", 0))
    raise ValueError(f"données non anticipée {type(data)}:{data}")


def get_updated(data) -> bool:
    if isinstance(data, float) or isinstance(data, int):
        return True
    if isinstance(data, dict):
        return data.get("updated", True)
    raise ValueError(f"données non anticipée {type(data)}:{data}")


class Command(BaseCommand):
    help = "Migrate trajectory if required"

    def handle(self, *args, **options):
        logger.info("migrate_trajectory_data")
        qs = Trajectory.objects.all()
        total = qs.count()
        logger.info(f"To process = {total}")
        for i, trajectory in enumerate(qs):
            trajectory.data = {y: v for y, v in trajectory.data.items() if int(y) >= 2022}
            trajectory.start = 2022
            trajectory.save()
            if i % 100 == 0:
                print(f"{i + 1}/{total}")
        print(f"{i + 1}/{total}")
        logger.info("End migrate_trajectory_data")
