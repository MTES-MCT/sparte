import logging
import re

from django.core.management.base import BaseCommand

from public_data.models import CouvertureSol, UsageSol


logger = logging.getLogger("management.commands")


def build_short_label(label):
    label_short = re.sub(r"\(.*\)", "", label).strip()

    if len(label_short) < 30:
        return label_short
    else:
        return f"{label_short[:30]}..."


class Command(BaseCommand):
    help = "Build short label"

    def handle(self, *args, **options):
        logger.info("Start build short label for couverture and usage")

        # add all keys with None
        for couv in CouvertureSol.objects.all():
            couv.label_short = build_short_label(couv.label)
            couv.save()

        for usage in UsageSol.objects.all():
            usage.label_short = build_short_label(usage.label)
            usage.save()

        logger.info("End")
