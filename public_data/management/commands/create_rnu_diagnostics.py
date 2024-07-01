import logging

from django.core.management.base import BaseCommand
from django.utils import timezone

from project.models import Emprise, Project
from project.models.create import trigger_async_tasks_rnu_pakage_one_off
from public_data.models import Commune, Land
from public_data.models.sudocuh import DocumentUrbanismeChoices, Sudocuh
from users.models import User
from utils.db import fix_poly

logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "create_rnu_diagnostics"

    def handle(self, *args, **options):
        mondiagartif_user, _ = User.objects.get_or_create(
            email="rnu.package@mondiagartif.beta.gouv.fr",
            first_name="Alexis",
            last_name="Athlani",
            organism=User.ORGANISMS.DDT,
            function="Développeur",
            defaults={"email_checked": timezone.now()},
        )

        emprise_to_create = []

        for commune in Commune.objects.filter(
            insee__in=[Sudocuh.objects.filter(du_opposable=DocumentUrbanismeChoices.RNU).values("code_insee")]
        ):
            land = Land(public_key=f"COMM_{commune.pk}")
            project = Project.objects.create(
                name=f"Diagnostic de {land.name}",
                is_public=True,
                analyse_start_date="2011",
                analyse_end_date="2022",
                level="COMM",
                land_id=str(land.id),
                land_type=land.land_type,
                territory_name=land.name,
                user=mondiagartif_user,
                import_status=Project.Status.SUCCESS,
                import_date=timezone.now(),
                import_error=None,
                async_add_city_done=True,
                first_year_ocsge=commune.first_millesime,
                last_year_ocsge=commune.last_millesime,
                available_millesimes=[commune.first_millesime, commune.last_millesime],
                async_find_first_and_last_ocsge_done=True,
                ocsge_coverage_status=Project.OcsgeCoverageStatus.COMPLETE_UNIFORM
                if commune.ocsge_available
                else Project.OcsgeCoverageStatus.NO_DATA,
                async_ocsge_coverage_status_done=True,
                async_set_combined_emprise_done=True,
            )
            project.cities.add(commune)

            emprise_to_create.append(
                Emprise(
                    mpoly=fix_poly(commune.mpoly),
                    srid_source=commune.srid_source,
                    project=project,
                )
            )

            if len(emprise_to_create) > 100:
                Emprise.objects.bulk_create(emprise_to_create)
                emprise_to_create = []

        if emprise_to_create:
            Emprise.objects.bulk_create(emprise_to_create)

        for project in Project.objects.filter(user=mondiagartif_user):
            trigger_async_tasks_rnu_pakage_one_off(project)
