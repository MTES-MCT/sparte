from django.conf import settings
from django.core.validators import MaxValueValidator
from django.db import models


class UserLandPreference(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="utilisateur",
    )
    land_id = models.CharField("Identifiant du territoire", max_length=255)
    land_type = models.CharField("Type de territoire", max_length=7)
    target_2031 = models.DecimalField(
        "Objectif de reduction a 2031 (en %)",
        max_digits=4,
        decimal_places=1,
        validators=[MaxValueValidator(100)],
        null=True,
        blank=True,
        default=None,
    )
    comparison_lands = models.JSONField(
        "Territoires de comparaison",
        default=list,
        blank=True,
    )

    class Meta:
        unique_together = ("user", "land_id", "land_type")
        verbose_name = "Preference utilisateur par territoire"
        verbose_name_plural = "Preferences utilisateur par territoire"

    def __str__(self):
        return f"{self.user} - {self.land_type}/{self.land_id}"
