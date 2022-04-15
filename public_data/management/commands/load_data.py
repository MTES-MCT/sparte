import logging
from pydoc import locate

from django.core.management.base import BaseCommand

# from public_data.tasks import load_data


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
        verbose = options["verbose"]
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
                    "Cerema",
                    "Renaturee2018to2015",
                    "Sybarval",
                    "Voirie2018",
                    "ZonesBaties2018",
                ]
            ]
        for class_name in class_names:
            logging.info("load data of %s (verbose=%s)", class_names, verbose)
            my_class = locate(class_name)
            my_class.load(verbose=verbose)
