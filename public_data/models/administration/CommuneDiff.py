from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class CommuneDiff(models.Model):
    city = models.ForeignKey("Commune", verbose_name="Commune", on_delete=models.CASCADE)
    year_old = models.IntegerField(
        "Ancienne année",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
    )
    year_new = models.IntegerField(
        "Nouvelle année",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
    )
    new_artif = models.DecimalField(
        "Artificialisation",
        max_digits=15,
        decimal_places=4,
        blank=True,
        null=True,
    )
    new_natural = models.DecimalField(
        "Renaturation",
        max_digits=15,
        decimal_places=4,
        blank=True,
        null=True,
    )
    net_artif = models.DecimalField(
        "Artificialisation nette",
        max_digits=15,
        decimal_places=4,
        blank=True,
        null=True,
    )

    class Meta:
        indexes = [
            models.Index(fields=["year_old"]),
            models.Index(fields=["year_new"]),
        ]

    @property
    def period(self):
        return f"{self.year_old} - {self.year_new}"
