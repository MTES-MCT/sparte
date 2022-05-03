import logging

from django.apps import AppConfig
from django.urls import path


logger = logging.getLogger(__name__)


class DjangoDocxTemplateConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "django_docx_template"

    def ready(self):
        try:
            from .models import DocxTemplate
            from .urls import urlpatterns
            from . import views

            for template in DocxTemplate.objects.all():
                urlpatterns.append(
                    path(
                        template.get_merge_url(),
                        views.TemplateMergeView.as_view(),
                        {"slug": template.slug},
                        name=f"{template.slug}-merge",
                    )
                )
        except:  # noqa: E722, B001
            logger.error("An error occured when loading django_docx_template urls.")
