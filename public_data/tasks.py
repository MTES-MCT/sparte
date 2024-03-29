import logging
from pydoc import locate

from celery import shared_task

from public_data.models.mixins import AutoLoadMixin

logging.basicConfig(level=logging.INFO)


@shared_task
def load_data(class_name, verbose=False):
    my_class: AutoLoadMixin = locate(class_name)

    if not my_class:
        raise ModuleNotFoundError(class_name)

    logging.info("load data of %s (verbose=%s)", my_class, verbose)

    my_class.load(verbose=verbose)
