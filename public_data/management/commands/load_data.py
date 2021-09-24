import logging

from pydoc import locate

from django.core.management.base import BaseCommand, CommandError


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
            class_names = [
                options["class"],
            ]
        else:
            class_names = [
                f"public_data.models.{x}"
                for x in [
                    "CommunesSybarval",
                    "Artificialisee2015to2018",
                    "Renaturee2018to2015",
                    "Artificielle2018",
                    "EnveloppeUrbaine2018",
                    "Voirie2018",
                    "ZonesBaties2018",
                    "Sybarval",
                ]
            ]
        for class_name in class_names:
            logging.info("class=%s", class_name)
            my_class = locate(class_name)
            if not my_class:
                raise CommandError("Unknown class")
            my_class.load(verbose=options["verbose"])
