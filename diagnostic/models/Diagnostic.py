from django.db import models

from public_data.models import AdminRef


class Diagnostic(models.Model):
    uuid = models.UUIDField(primary_key=True)
    label = models.TextField()
    land_id = models.CharField(max_length=100)
    land_type = models.CharField(max_length=100, choices=AdminRef.CHOICES)
    slug = models.SlugField()
