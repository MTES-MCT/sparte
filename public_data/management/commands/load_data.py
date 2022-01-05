import logging
import time

from django.core.management.base import BaseCommand

from public_data.tasks import load_data


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Given a class, the command will reload all the associated data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--class",
            type=str,
            help="class name that need to be reloaded",
        )
        parser.add_argument(
            "--verbose",
            action="store_true",
            help="To actrivate verbose mode of LayerMapping",
        )

    def handle(self, *args, **options):
        logger.info("Load data for a model")
        if "class" in options and options["class"]:
            class_names = [options["class"]]
        else:
            class_names = [
                f"public_data.models.{x}"
                for x in [
                    "Artificialisee2015to2018",
                    "Artificielle2018",
                    "CommunesSybarval",
                    "EnveloppeUrbaine2018",
                    "Ocsge2015",
                    "Ocsge2018",
                    "RefPlan",
                    "Renaturee2018to2015",
                    "Sybarval",
                    "Voirie2018",
                    "ZonesBaties2018",
                ]
            ]
        tasks = dict()
        for class_name in class_names:
            logger.info("Management command load_data with class=%s", class_name)
            tasks[class_name] = load_data.delay(class_name, verbose=options["verbose"])
            time.sleep(5)

        while len(tasks) > 0:
            time.sleep(60)
            logger.info("Update on remaining tasks %d", len(tasks))
            for key, task in tasks.items():
                logger.info("%s is %s", key, task.status)
                if task.status == "FAILURE":
                    logger.info(task.info.__repr__())
            tasks = {k: t for k, t in tasks.items() if t.status == "PENDING"}
