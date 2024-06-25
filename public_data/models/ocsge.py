from django.contrib.gis.db import models
from django.contrib.gis.db.models.functions import Area, Intersection, MakeValid
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models import Sum

from public_data.models.enums import SRID
from public_data.models.mixins import DataColorationMixin, TruncateTableMixin
from utils.db import DynamicSRIDTransform, IntersectManager


class Ocsge(TruncateTableMixin, DataColorationMixin, models.Model):
    couverture = models.CharField("Couverture du sol", max_length=254)
    usage = models.CharField("Usage du sol", max_length=254)
    id_source = models.CharField("ID source", max_length=200)
    year = models.IntegerField("Année", validators=[MinValueValidator(2000), MaxValueValidator(2050)])
    is_artificial = models.BooleanField("Est artificiel")
    is_impermeable = models.BooleanField(
        "Est imperméable",
    )
    surface = models.DecimalField("surface", max_digits=15, decimal_places=4)
    departement = models.CharField("Département", max_length=15)

    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    objects = IntersectManager()

    default_property = "id"

    class Meta:
        verbose_name = "OCSGE"
        verbose_name_plural = verbose_name
        indexes = [
            models.Index(fields=["couverture"]),
            models.Index(fields=["usage"]),
            models.Index(fields=["year"]),
            models.Index(fields=["is_artificial"]),
            models.Index(fields=["departement"]),
        ]
        unique_together = [["id_source", "year", "departement"]]

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
        qs = qs.annotate(intersection_surface=Area(DynamicSRIDTransform("intersection", "srid_source")))
        qs = qs.values(field_group_by).order_by(field_group_by)
        qs = qs.annotate(total_surface=Sum("intersection_surface"))
        data = {_[field_group_by]: _["total_surface"].sq_m / 10000 for _ in qs}
        return data


class OcsgeDiff(TruncateTableMixin, DataColorationMixin, models.Model):
    year_old = models.IntegerField("Ancienne année", validators=[MinValueValidator(2000), MaxValueValidator(2050)])
    year_new = models.IntegerField("Nouvelle année", validators=[MinValueValidator(2000), MaxValueValidator(2050)])
    cs_new = models.CharField("Code nouvelle couverture", max_length=12)
    cs_old = models.CharField("Code ancienne couverture", max_length=12)
    us_new = models.CharField("Code nouveau usage", max_length=12)
    us_old = models.CharField("Code ancien usage", max_length=12)
    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )
    surface = models.DecimalField("surface", max_digits=15, decimal_places=4)
    is_new_artif = models.BooleanField()
    is_new_natural = models.BooleanField(
        "Aussi appelé désartificialisation",
    )
    is_new_impermeable = models.BooleanField()
    is_new_not_impermeable = models.BooleanField(
        "Aussi appelé désimperméabilisation",
    )

    departement = models.CharField("Département", max_length=15)

    objects = IntersectManager()

    default_property = "surface"
    default_color = "Red"

    class Meta:
        verbose_name = "OCSGE - Différence"
        verbose_name_plural = verbose_name
        indexes = [
            models.Index(fields=["year_old"]),
            models.Index(fields=["year_new"]),
            models.Index(fields=["departement"]),
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
    city = models.CharField("Commune", max_length=254)
    departement = models.CharField("Département", max_length=15)
    objects = IntersectManager()

    class Meta:
        verbose_name = "OCSGE - Artificialisation (par commune)"
        verbose_name_plural = verbose_name
        constraints = []
        unique_together = [["year", "city"]]
        indexes = [
            models.Index(fields=["year"]),
            models.Index(fields=["city"]),
            models.Index(fields=["departement"]),
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
    )
    surface = models.DecimalField("surface", max_digits=15, decimal_places=4)
    departement = models.CharField("Département", max_length=15)

    objects = IntersectManager()

    class Meta:
        verbose_name = "OCSGE - Zone construite"
        verbose_name_plural = verbose_name
        indexes = [
            models.Index(fields=["year"]),
            models.Index(fields=["departement"]),
        ]
