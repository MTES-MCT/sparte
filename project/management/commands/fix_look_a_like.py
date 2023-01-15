import logging

from django.core.management.base import BaseCommand
from django.db.models import Value
from django.db.models.functions import Replace

from project.models import Project

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Use new referentiel in look-a-like Project field"

    def handle(self, *args, **options):
        logger.info("Start - fix look_a_like field")
        qs = Project.objects.all()
        logger.info(f"Project to be fixed: {qs.count()}")
        qs.update(look_a_like=Replace("look_a_like", Value("COMMUNE"), Value("COMM")))
        logger.info("End - fix look_a_like field")
