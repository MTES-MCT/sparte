from django.apps import AppConfig
from django.db.models.signals import post_save


class MetabaseConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "metabase"

    def ready(self):
        from metabase.models import StatDiagnostic

        post_save.connect(
            StatDiagnostic.receiver_project_post_save,
            sender="project.Project",
            dispatch_uid="post_save_stat_diagnostic_for_project",
        )
        post_save.connect(
            StatDiagnostic.receiver_request_post_save,
            sender="project.Request",
            dispatch_uid="post_save_stat_diagnostic_for_request",
        )
