from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class CommunePop(models.Model):
    city = models.ForeignKey("Commune", verbose_name="Commune", on_delete=models.CASCADE, related_name="pop")
    year = models.IntegerField(
        "Millésime",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
    )
    pop = models.IntegerField("Population", blank=True, null=True)
    pop_change = models.IntegerField("Population", blank=True, null=True)
    household = models.IntegerField("Nb ménages", blank=True, null=True)
    household_change = models.IntegerField("Population", blank=True, null=True)
