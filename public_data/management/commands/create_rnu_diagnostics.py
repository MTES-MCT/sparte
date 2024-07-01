import logging
from datetime import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from project.models import Project
from project.models.create import trigger_async_tasks_rnu_pakage_one_off
from public_data.models import Commune, Land
from public_data.models.sudocuh import DocumentUrbanismeChoices, Sudocuh
from users.models import User

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
            defaults={"email_checked": datetime.now()},
        )

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
            )
            trigger_async_tasks_rnu_pakage_one_off(project)
            break
