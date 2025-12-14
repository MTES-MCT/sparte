import uuid

from django.conf import settings
from django.db import models


def export_pdf_path(instance, _filename):
    """Génère le chemin de stockage pour les PDFs exportés."""
    return f"exports/{instance.job_id}.pdf"


class ExportJob(models.Model):
    """Représente un job d'export PDF."""

    class Status(models.TextChoices):
        PENDING = "pending", "En cours"
        COMPLETED = "completed", "Terminé"
        FAILED = "failed", "Échec"

    job_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    pdf_file = models.FileField(upload_to=export_pdf_path, blank=True)
    error = models.TextField(blank=True, null=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="export_jobs",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["job_id"]),
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self):
        return f"ExportJob {self.job_id} ({self.status})"
