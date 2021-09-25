import logging

from django.core.management.base import BaseCommand

from public_data.tasks import load_data


logging.basicConfig(level=logging.INFO)


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
        logging.info("Load data for a model")
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
                    "Renaturee2018to2015",
                    "Sybarval",
                    "Voirie2018",
                    "ZonesBaties2018",
                ]
            ]
        for class_name in class_names:
            logging.info("Management command load_data with class=%s", class_name)
            load_data.delay(class_name, verbose=options["verbose"])
