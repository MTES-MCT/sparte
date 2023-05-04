import logging

from django.apps import AppConfig
from django.db.models.signals import post_save

logger = logging.getLogger(__name__)


def do_project_post_save(instance, created: bool, **kwargs):
    from metabase.tasks import async_create_stat_for_project

    logger.info("Receiving post save project signal then queue async_create_stat_for_project")
    async_create_stat_for_project.delay(
        instance.id,
        kwargs.get("update_fields") == {"async_add_city_done"},
    )


def do_request_post_save(instance, created: bool, **kwargs):
    from metabase.tasks import async_create_stat_for_request

    logger.info("Receiving post save project signal then queue async_create_stat_for_project")
    if created:
        async_create_stat_for_request.delay(instance.id)


class MetabaseConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "metabase"

    def ready(self):
        post_save.connect(
            do_project_post_save,
            sender="project.Project",
            dispatch_uid="post_save_stat_diagnostic_for_project",
        )
        post_save.connect(
            do_request_post_save,
            sender="project.Request",
            dispatch_uid="post_save_stat_diagnostic_for_request",
        )
