import logging

import celery
from django.core.management.base import BaseCommand

from project.models import Request
from project.tasks import create_zip_departement_rnu_package_one_off
from public_data.models import Commune, Departement, Sudocuh
from public_data.models.sudocuh import DocumentUrbanismeChoices

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "create_rnu_packages"

    def add_arguments(self, parser):
        parser.add_argument("--departement", type=str, required=False)

    def handle(self, *args, **options):
        tasks = []

        departements = Departement.objects.all()

        if options["departement"]:
            departements = Departement.objects.filter(source_id=options["departement"])

        communes = Commune.objects.all()

        if options["departement"]:
            communes = Commune.objects.filter(
                departement__source_id=options["departement"],
                insee__in=[Sudocuh.objects.filter(du_opposable=DocumentUrbanismeChoices.RNU).values("code_insee")],
            )

        commune_count = communes.count()
        request_for_communes_count = Request.objects.filter(
            done=True, project__land_id__in=[str(commune.id) for commune in communes]
        ).count()

        if commune_count != request_for_communes_count:
            raise ValueError(
                (
                    f"Commune count ({commune_count}) does not match "
                    "request for communes count ({request_for_communes_count})"
                )
            )
        else:
            logger.info(
                f"Commune count ({commune_count}) matches request for communes count ({request_for_communes_count})"
            )

        for departement in departements:
            logger.info(f"Creating RNU package for departement {departement.source_id}")
            tasks.append(create_zip_departement_rnu_package_one_off.si(departement.source_id))

        celery.group(*tasks).apply_async(queue="long")
