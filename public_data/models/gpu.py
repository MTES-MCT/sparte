"""
Les zones urbaines fournies par le Géoportail de l'urbanisme
"""
from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models import UniqueConstraint

from public_data.models.enums import SRID
from utils.db import IntersectMixin


class ZoneUrbaManager(IntersectMixin, models.Manager):
    pass


class ZoneUrba(models.Model):
    gid = models.CharField("gid", max_length=80, blank=True, null=True)
    libelle = models.CharField("libelle", max_length=80, blank=True, null=True)
    libelong = models.CharField("libelong", max_length=254, blank=True, null=True)
    origin_typezone = models.CharField("typezone", max_length=80, blank=True, null=True)
    origin_insee = models.CharField("insee", max_length=80, blank=True, null=True)
    idurba = models.CharField("idurba", max_length=80, blank=True, null=True)
    idzone = models.CharField("idzone", max_length=80, blank=True, null=True)
    lib_idzone = models.CharField("lib_idzone", max_length=80, blank=True, null=True)
    partition = models.CharField("partition", max_length=80, blank=True, null=True)
    destdomi = models.CharField("destdomi", max_length=80, blank=True, null=True)
    nomfic = models.CharField("nomfic", max_length=80, blank=True, null=True)
    urlfic = models.CharField("urlfic", max_length=178, blank=True, null=True)
    datappro = models.CharField("datappro", max_length=80, blank=True, null=True)
    datvalid = models.CharField("datvalid", max_length=80, blank=True, null=True)

    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    # calulated fields
    insee = models.CharField("insee", max_length=10, blank=True, null=True)
    area = models.DecimalField("area", max_digits=15, decimal_places=4, blank=True, null=True)
    typezone = models.CharField("typezone", max_length=3, blank=True, null=True)

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
            models.Index(fields=["insee"]),
            models.Index(fields=["typezone"]),
        ]


class ArtifAreaZoneUrba(models.Model):
    zone_urba = models.ForeignKey(ZoneUrba, on_delete=models.CASCADE)
    year = models.IntegerField("Millésime", validators=[MinValueValidator(2000), MaxValueValidator(2050)])
    area = models.DecimalField("Surface artificielle", max_digits=15, decimal_places=4)

    def __str__(self):
        return f"{self.zone_urba_id} {self.year} {self.area}Ha"

    class Meta:
        constraints = [UniqueConstraint(fields=["zone_urba", "year"], name="unique_zone_year")]
        indexes = [
            models.Index(fields=["zone_urba"]),
            models.Index(fields=["year"]),
            models.Index(fields=["zone_urba", "year"]),
        ]
