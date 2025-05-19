"""
Celery config file

https://docs.celeryproject.org/en/stable/django/first-steps-with-django.html

"""
from __future__ import absolute_import

import os

from celery import Celery
from celery.schedules import crontab
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


app.conf.beat_schedule = {
    "alive-every-minute": {
        "task": "config.celery.log",
        "schedule": crontab(minute="*/15"),
        "args": ("I am alive",),
    },
    "alerte-blocked-diagnostic": {
        "task": "project.tasks.project.alert_on_blocked_diagnostic",
        "schedule": crontab(minute="0", hour="8,12,16"),
    },
    "default-alive-timestamp": {
        "task": "home.tasks.update_alive_timestamp",
        "schedule": crontab(minute="*/15"),
        "args": ("default",),
    },
    "long-alive-timestamp": {
        "task": "home.tasks.update_alive_timestamp",
        "schedule": crontab(minute="*/15"),
        "args": ("long",),
        "options": {
            "queue": "long",
        },
    },
    "check-inactive-admins": {
        "task": "users.tasks.check_inactive_admins",
        # schedule to every monday at 8:00
        "schedule": crontab(minute="0", hour="8"),
    },
}


@app.task
def log(message):
    # start logging
    logger.info(message)
