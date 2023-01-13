"""
Celery config file

https://docs.celeryproject.org/en/stable/django/first-steps-with-django.html

"""
from __future__ import absolute_import
import os

from celery import Celery
from celery.utils.log import get_task_logger

from django.apps import apps


logger = get_task_logger(__name__)

# this code copied from manage.py
# set the default Django settings module for the 'celery' app.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# you change change the name here
app = Celery("config")

# read config from Django settings, the CELERY namespace would make celery
# config keys has `CELERY` prefix
app.config_from_object("django.conf:settings", namespace="CELERY")

# load tasks.py in django apps
app.autodiscover_tasks(lambda: [n.name for n in apps.get_app_configs()])


app.conf.timezone = "UTC"


@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Print beat is alive every 60 seconds.
    sender.add_periodic_task(60.0, log.s("Celery beat is alive"), name="alive")


@app.task
def log(message):
    # start logging
    logger.info(message)
