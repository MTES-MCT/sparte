from django.db import models
from django.utils.functional import cached_property

from public_data.models import Departement
from public_data.models.sudocuh import DocumentUrbanismeChoices, Sudocuh


class RNUPackage(models.Model):
    file = models.FileField(upload_to="rnu_packages", blank=True, null=True)
    app_version = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    departement_official_id = models.CharField(
        max_length=10,
        unique=True,
    )

    @cached_property
    def departement(self):
        return Departement.objects.get(source_id=self.departement_official_id)

    @cached_property
    def communes(self):
        sudocuh = Sudocuh.objects.filter(du_opposable=DocumentUrbanismeChoices.RNU)
        return self.departement.commune_set.filter(
            insee__in=sudocuh.values("code_insee"),
        )
