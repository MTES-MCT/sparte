"""
Les zones urbaines fournies par le Géoportail de l'urbanisme
"""
from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

from public_data.models.enums import SRID
from utils.db import IntersectMixin


class ZoneUrbaManager(IntersectMixin, models.Manager):
    pass


class ZoneUrba(models.Model):
    id = models.TextField("id", primary_key=True)
    libelle = models.CharField("libelle", max_length=80, blank=True, null=True)
    libelong = models.CharField("libelong", max_length=254, blank=True, null=True)
    idurba = models.CharField("idurba", max_length=80, blank=True, null=True)
    typezone = models.CharField("typezone", max_length=3, blank=True, null=True)
    partition = models.CharField("partition", max_length=80, blank=True, null=True)
    datappro = models.CharField("datappro", max_length=80, blank=True, null=True)
    datvalid = models.CharField("datvalid", max_length=80, blank=True, null=True)
    area = models.DecimalField("area", max_digits=15, decimal_places=4, blank=True, null=True)
    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    objects = ZoneUrbaManager()

    def get_color(self):
        transco = {
            "a": [255, 255, 0],
            "auc": [255, 101, 101],
            "aus": [254, 204, 190],
            "n": [86, 170, 2],
            "u": [230, 0, 0],
        }
        return transco.get(self.typezone.lower(), [0, 0, 0])

    def __str__(self):
        return f"{self.insee} {self.typezone} {self.area}Ha"

    class Meta:
        indexes = [
            models.Index(fields=["typezone"]),
        ]


class ArtifAreaZoneUrba(models.Model):
    zone_urba = models.ForeignKey(ZoneUrba, on_delete=models.CASCADE)
    year = models.IntegerField("Millésime", validators=[MinValueValidator(2000), MaxValueValidator(2050)])
    departement = models.CharField("Département", max_length=3)
    area = models.DecimalField("Surface artificialisée", max_digits=15, decimal_places=4)

    def __str__(self):
        return f"{self.zone_urba_id} {self.year} {self.area}Ha"

    class Meta:
        indexes = [
            models.Index(fields=["year"]),
        ]
