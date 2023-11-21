"""
Nouvelle VERSION lors de la 1.3.0 : on souhaite normaliser les données OCSGE
pour la france entière.

1. Ocsge
Les données de l'OCSGE avec la couverture complète de la France, année par année.
On stock ici tous les millésimes de tous les départements.


2. OcsgeDiff
Contient les différences entres les millésimes :qu'est-ce qui a été de nouveau
naturalisé et qu'est ce qui a été artificialisé...
Comme précédemment, on stock dans ce modèle tous les millésimes, tous les
dépertements...


Remarque : il est possible qu'il faille partitionner ces données à terme pour cause de
problème de performance

"""
from django.contrib.gis.db import models
from django.contrib.gis.db.models.functions import (
    Area,
    Intersection,
    MakeValid,
    Transform,
)
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models import Sum

from public_data.models.enums import SRID
from utils.db import IntersectManager

from .couverture_usage import CouvertureUsageMatrix
from .mixins import DataColorationMixin, TruncateTableMixin


class Ocsge(TruncateTableMixin, DataColorationMixin, models.Model):
    couverture = models.CharField("Couverture du sol", max_length=254, blank=True, null=True)
    usage = models.CharField("Usage du sol", max_length=254, blank=True, null=True)
    id_source = models.CharField("ID source", max_length=200, blank=True, null=True)
    year = models.IntegerField("Année", validators=[MinValueValidator(2000), MaxValueValidator(2050)])
    matrix = models.ForeignKey(CouvertureUsageMatrix, on_delete=models.PROTECT, null=True, blank=True)
    couverture_label = models.CharField("Libellé couverture du sol", max_length=254, blank=True, null=True)
    usage_label = models.CharField("Libellé usage du sol", max_length=254, blank=True, null=True)
    is_artificial = models.BooleanField("Est artificiel", null=True, blank=True)
    surface = models.DecimalField("surface", max_digits=15, decimal_places=4, blank=True, null=True)
    departement = models.ForeignKey("public_data.Departement", on_delete=models.PROTECT, null=True, blank=True)

    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    objects = IntersectManager()

    default_property = "id"

    class Meta:
        indexes = [
            models.Index(fields=["couverture"]),
            models.Index(fields=["usage"]),
            models.Index(fields=["year"]),
            models.Index(fields=["is_artificial"]),
        ]

    @classmethod
    def get_groupby(cls, field_group_by, coveredby, year):
        """Return SUM(surface) GROUP BY couverture if coveredby geom.
        Return {
            "CS1.1.1": 678,
            "CS1.1.2": 419,
        }

        Parameters:
        * field_group_by: 'couverture' or 'usage'
        * coveredby: polynome of the perimeter in which Ocsge items mut be
        """
        qs = cls.objects.filter(year=year)
        qs = qs.filter(mpoly__intersects=coveredby)
        qs = qs.annotate(intersection=Intersection(MakeValid("mpoly"), coveredby.make_valid()))
        qs = qs.annotate(intersection_surface=Area(Transform("intersection", 2154)))
        qs = qs.values(field_group_by).order_by(field_group_by)
        qs = qs.annotate(total_surface=Sum("intersection_surface"))
        data = {_[field_group_by]: _["total_surface"].sq_m / 10000 for _ in qs}
        return data


class OcsgeDiff(TruncateTableMixin, DataColorationMixin, models.Model):
    year_old = models.IntegerField("Ancienne année", validators=[MinValueValidator(2000), MaxValueValidator(2050)])
    year_new = models.IntegerField("Nouvelle année", validators=[MinValueValidator(2000), MaxValueValidator(2050)])
    cs_new = models.CharField("Code nouvelle couverture", max_length=12, blank=True, null=True)
    cs_old = models.CharField("Code ancienne couverture", max_length=12, blank=True, null=True)
    us_new = models.CharField("Code nouveau usage", max_length=12, blank=True, null=True)
    us_old = models.CharField("Code ancien usage", max_length=12, blank=True, null=True)
    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )
    surface = models.DecimalField("surface", max_digits=15, decimal_places=4, blank=True, null=True)
    cs_old_label = models.CharField("Ancienne couverture", max_length=254, blank=True, null=True)
    us_old_label = models.CharField("Ancien usage", max_length=254, blank=True, null=True)
    cs_new_label = models.CharField("Nouvelle couverture", max_length=254, blank=True, null=True)
    us_new_label = models.CharField("Nouveau usage", max_length=254, blank=True, null=True)
    old_is_artif = models.BooleanField(blank=True, null=True)
    new_is_artif = models.BooleanField(blank=True, null=True)
    is_new_artif = models.BooleanField(blank=True, null=True)
    is_new_natural = models.BooleanField(blank=True, null=True)
    departement = models.ForeignKey("public_data.Departement", on_delete=models.PROTECT, null=True, blank=True)
    old_matrix = models.ForeignKey(
        CouvertureUsageMatrix,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="ocsge_dif_old",
    )
    new_matrix = models.ForeignKey(
        CouvertureUsageMatrix,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="ocsge_difnew",
    )

    objects = IntersectManager()

    default_property = "surface"
    default_color = "Red"

    class Meta:
        indexes = [
            models.Index(fields=["year_old"]),
            models.Index(fields=["year_new"]),
        ]


class ArtificialArea(TruncateTableMixin, DataColorationMixin, models.Model):
    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )
    year = models.IntegerField(
        "Année",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
    )
    surface = models.DecimalField("surface", max_digits=15, decimal_places=4)
    city = models.ForeignKey("public_data.Commune", on_delete=models.CASCADE)
    departement = models.ForeignKey("public_data.Departement", on_delete=models.PROTECT, null=True, blank=True)

    objects = IntersectManager()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["city", "year"], name="artificialarea-city-year-unique"),
        ]
        indexes = [
            models.Index(fields=["year"]),
            models.Index(fields=["city"]),
            models.Index(fields=["city", "year"]),
        ]


class ZoneConstruite(TruncateTableMixin, DataColorationMixin, models.Model):
    id_source = models.CharField("ID Source", max_length=200)
    millesime = models.CharField("Millesime", max_length=200)
    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    # calculated
    year = models.IntegerField(
        "Année",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
        null=True,
        blank=True,
    )
    surface = models.DecimalField("surface", max_digits=15, decimal_places=4, blank=True, null=True)
    departement = models.ForeignKey("public_data.Departement", on_delete=models.PROTECT, null=True, blank=True)

    objects = IntersectManager()

    class Meta:
        indexes = [
            models.Index(fields=["year"]),
        ]
