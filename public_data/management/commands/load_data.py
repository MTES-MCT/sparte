import logging

from pydoc import locate

from django.core.management.base import BaseCommand, CommandError


logging.basicConfig(level=logging.INFO)


class Command(BaseCommand):
    help = "Given a class, the command will reload all the associated data"

    def add_arguments(self, parser):
        parser.add_argument(
            "class_name", type=str, help="class name that need to be reloaded"
        )

    def handle(self, *args, **options):
        logging.info("Load data for a model")
        class_name = options["class_name"]
        logging.info("class=%s", class_name)
        my_class = locate(class_name)
        if not my_class:
            raise CommandError("Unknown class")
        my_class.load()
