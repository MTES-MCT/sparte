import uuid

from django.conf import settings
from django.db import models

from project.models.request import RequestedDocumentChoices
from public_data.models import AdminRef


class ReportDraft(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="report_drafts",
    )
    project = models.ForeignKey(
        "project.Project",
        on_delete=models.CASCADE,
        related_name="report_drafts",
    )
    report_type = models.CharField(
        max_length=30,
        choices=RequestedDocumentChoices.choices,
    )
    name = models.CharField(max_length=255)
    content = models.JSONField(default=dict)
    land_type = models.CharField(
        "Type de territoire",
        choices=AdminRef.CHOICES,
        max_length=7,
        blank=True,
        null=True,
    )
    land_id = models.CharField(
        "Identifiant du territoire",
        max_length=255,
        blank=True,
        null=True,
    )
    comparison_lands = models.JSONField(
        "Territoires de comparaison",
        default=list,
        blank=True,
        help_text="Liste des territoires de comparaison",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        verbose_name = "Brouillon de rapport"
        verbose_name_plural = "Brouillons de rapports"

    def __str__(self):
        return f"{self.name} - {self.get_report_type_display()}"
