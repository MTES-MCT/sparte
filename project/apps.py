from django.apps import AppConfig
from simple_history.signals import pre_create_historical_record


def pre_create_historical_record_callback(sender, **kwargs):
    project_history = kwargs['history_instance']
    if project_history.async_theme_map_gpu_done is None:
        project_history.async_theme_map_gpu_done = False
        project_history.async_thme_map_fill_gpu_done = False


class ProjectConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "project"

    def ready(self):
        pre_create_historical_record.connect(
            pre_create_historical_record_callback,
            sender="project.Project",
        )
