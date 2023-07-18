import celery
import logging

from django.core.management.base import BaseCommand

from metabase.tasks import async_create_stat_for_project
from project import tasks as t
from project.models import Project


logger = logging.getLogger("management.commands")


class Command(BaseCommand):
    help = "Check project async tasks and relaunch what is required"

    def add_arguments(self, parser):
        parser.add_argument(
            "--id",
            type=str,
        )

    def handle(self, *args, **options):
        logger.info("Start celery recover project")
        if not options["id"]:
            logger.warning("An id is required, us --id options.")
            return
        for id in options["id"].split(","):
            self.process_project(id)

    def process_project(self, id):  # noqa
        try:
            self.diagnostic = Project.objects.get(id=id)
            self.id = self.diagnostic.id
        except Project.DoesNotExist:
            logger.error("Project not exists.")
            return
        if not self.diagnostic.async_add_city_done:
            return self.recover_add_city()
        if not self.diagnostic.async_set_combined_emprise_done:
            return self.recover_set_combined_emprise()
        if not self.diagnostic.async_find_first_and_last_ocsge_done:
            t.find_first_and_last_ocsge.delay(self.id)
        if not self.diagnostic.async_add_neighboors_done:
            t.add_neighboors.delay(self.id)
        if not self.diagnostic.async_cover_image_done:
            t.generate_cover_image.delay(self.id)
        if not self.diagnostic.async_generate_theme_map_conso_done:
            t.generate_theme_map_conso.delay(self.id)
        if not self.diagnostic.async_generate_theme_map_artif_done:
            t.generate_theme_map_artif.delay(self.id)
        if not self.diagnostic.async_theme_map_understand_artif_done:
            t.generate_theme_map_understand_artif.delay(self.id)

    def recover_add_city(self):
        try:
            id_list = self.diagnostic.land_ids.split(",")
        except AttributeError:
            logger.warning("Project too old, no land id saved")
            return
        if len(id_list) > 1:
            logger.warning("Too old project, it contains several territory.")
            return
        public_key = f"{self.diagnostic.land_type}_{self.diagnostic.land_ids}"
        celery.chain(
            t.add_city.si(self.id, public_key),
            t.set_combined_emprise.si(self.id),
            celery.group(
                t.find_first_and_last_ocsge.si(self.id),
                t.add_neighboors.si(self.id),
            ),
            celery.group(
                t.generate_cover_image.si(self.id),
                t.generate_theme_map_conso.si(self.id),
                t.generate_theme_map_artif.si(self.id),
                t.generate_theme_map_understand_artif.si(self.id),
            ),
            # to not make user wait for other stuff, nuild metabase stat after all others tasks
            async_create_stat_for_project.si(self.id, do_location=True),
        ).apply_async()

    def recover_set_combined_emprise(self):
        celery.chain(
            t.set_combined_emprise.si(self.id),
            celery.group(
                t.find_first_and_last_ocsge.si(self.id),
                t.add_neighboors.si(self.id),
            ),
            celery.group(
                t.generate_cover_image.si(self.id),
                t.generate_theme_map_conso.si(self.id),
                t.generate_theme_map_artif.si(self.id),
                t.generate_theme_map_understand_artif.si(self.id),
            ),
            # to not make user wait for other stuff, nuild metabase stat after all others tasks
            async_create_stat_for_project.si(self.id, do_location=True),
        ).apply_async()
