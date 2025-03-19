from django.db import models

from public_data.models import AdminRef

from .enums import ConsommationCorrectionStatus, OcsgeStatus


class StatusDesDonnees(models.Model):
    uuid = models.UUIDField(primary_key=True)
    land_id = models.CharField(max_length=100)
    land_type = models.CharField(max_length=100, choices=AdminRef.CHOICES)

    ocsge = models.CharField(choices=OcsgeStatus)
    consommation = models.CharField(choices=ConsommationCorrectionStatus)
