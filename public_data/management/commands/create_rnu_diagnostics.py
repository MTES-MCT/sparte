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

    def add_arguments(self, parser):
        parser.add_argument("--departement", type=str, required=True)

    def handle(self, *args, **options):
        mondiagartif_user, _ = User.objects.get_or_create(
            email="rnu.package@mondiagartif.beta.gouv.fr",
            first_name="Alexis",
            last_name="Athlani",
            organism=User.ORGANISMS.DDT,
            function="Développeur",
            defaults={"email_checked": timezone.now()},
        )

        projects = []

        for commune in Commune.objects.filter(
            departement__source_id=options["departement"],
            insee__in=[Sudocuh.objects.filter(du_opposable=DocumentUrbanismeChoices.RNU).values("code_insee")],
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
                async_theme_map_gpu_done=True,
                async_theme_map_fill_gpu_done=True,
                async_add_comparison_lands_done=True,
            )

            project.cities.add(commune)

            Emprise.objects.create(
                mpoly=fix_poly(commune.mpoly),
                srid_source=commune.srid_source,
                project=project,
            )

            similar_lands_public_keys = [
                comparison_land.public_key for comparison_land in project.get_comparison_lands()
            ]

            project.refresh_from_db()

            project.add_look_a_like(public_key=similar_lands_public_keys, many=True)

            projects.append(project)

        for project in projects:
            trigger_async_tasks_rnu_pakage_one_off(project)
