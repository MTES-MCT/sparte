import logging

import celery
from django.core.management.base import BaseCommand

from project.models import Request
from project.tasks import create_zip_departement_rnu_package_one_off
from public_data.models import Commune, Departement, Sudocuh
from public_data.models.sudocuh import DocumentUrbanismeChoices
from users.models import User

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "create_rnu_packages"

    def add_arguments(self, parser):
        parser.add_argument("--departement", type=str, required=False)

    def check_requests_are_created_for_departement(self, departement):
        communes = Commune.objects.filter(
            insee__in=[Sudocuh.objects.filter(du_opposable=DocumentUrbanismeChoices.RNU).values("code_insee")],
            departement=departement,
        )

        commune_count = communes.count()
        request_for_communes_count = Request.objects.filter(
            done=True,
            project__land_id__in=[str(commune.id) for commune in communes],
            user=User.objects.get(email="rnu.package@mondiagartif.beta.gouv.fr"),
        ).count()

        if commune_count != request_for_communes_count:
            logger.error(
                (
                    f"Commune count ({commune_count}) does not match "
                    f"request for communes count ({request_for_communes_count})"
                )
            )
        else:
            logger.info(
                f"Commune count ({commune_count}) matches request for communes count ({request_for_communes_count})"
            )

        return True

    def handle(self, *args, **options):
        tasks = []

        departements = Departement.objects.all()

        if options["departement"]:
            departements = departements.filter(source_id=options["departement"])

        for departement in departements:
            if self.check_requests_are_created_for_departement(departement):
                logger.info(f"Creating RNU package for departement {departement.source_id}")
                tasks.append(create_zip_departement_rnu_package_one_off.si(departement.source_id))

        celery.group(*tasks).apply_async(queue="long")
