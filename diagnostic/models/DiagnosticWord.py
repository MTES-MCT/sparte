from django.db import models

from public_data.models import AdminRef


class DiagnosticWord(models.Model):
    uuid = models.UUIDField(primary_key=True)
    land_id = models.CharField(max_length=100)
    land_type = models.CharField(max_length=100, choices=AdminRef.CHOICES)
    url = models.URLField()
