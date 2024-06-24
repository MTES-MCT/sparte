from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class CommuneSol(models.Model):
    class Meta:
        verbose_name = "OCSGE - Couverture x usage des sols (par commune)"
        verbose_name_plural = verbose_name
        indexes = [
            models.Index(name="communesol-triplet-index", fields=["city", "matrix", "year"]),
            models.Index(name="communesol-city-index", fields=["city"]),
            models.Index(name="communesol-year-index", fields=["year"]),
            models.Index(name="communesol-matrix-index", fields=["matrix"]),
        ]

    city = models.ForeignKey("Commune", verbose_name="Commune", on_delete=models.CASCADE)
    year = models.IntegerField(
        "Millésime",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
    )
    matrix = models.ForeignKey("CouvertureUsageMatrix", on_delete=models.CASCADE)
    surface = models.DecimalField("Surface", max_digits=15, decimal_places=4, blank=True, null=True)
