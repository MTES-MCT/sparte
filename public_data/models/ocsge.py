"""
Nouvelle VERSION lors de la 1.3.0 : on souhaite normaliser les données OCSGE
pour la france entière.

1. Ocsge
========
Les données de l'OCSGE avec la couverture complète de la France, année par année.
On stock ici tous les millésimes de tous les départements.


2. OcsgeDiff
============
Contient les différences entres les millésimes :qu'est-ce qui a été de nouveau
naturalisé et qu'est ce qui a été artificialisé...
Comme précédemment, on stock dans ce modèle tous les millésimes, tous les
dépertements...


Remarque : il est possible qu'il faille partitionner ces données à terme pour cause de
problème de performance

"""
from django.contrib.gis.db import models
from django.contrib.gis.db.models.functions import Intersection, Area, Transform
from django.core.validators import MinValueValidator, MaxValueValidator

# from django.db import connection
from django.db.models import Sum, OuterRef, Subquery
from django.db.models.functions import Cast

from .mixins import DataColorationMixin, TruncateTableMixin

from .couverture_usage import CouvertureUsageMatrix


class Ocsge(TruncateTableMixin, DataColorationMixin, models.Model):
    couverture = models.CharField(
        "Couverture du sol", max_length=254, blank=True, null=True
    )
    usage = models.CharField("Usage du sol", max_length=254, blank=True, null=True)
    # Nouveaux champs pour le Gers
    id_source = models.CharField("ID source", max_length=200, blank=True, null=True)
    id_origine = models.CharField("ID origine", max_length=200, blank=True, null=True)
    millesime_source = models.CharField(
        "Source du millesime", max_length=200, blank=True, null=True
    )
    # deprecated. to keep for Arcachon
    millesime = models.DateField("Millésime", blank=True, null=True)

    # calculated fields
    year = models.IntegerField(
        "Année", validators=[MinValueValidator(2000), MaxValueValidator(2050)]
    )
    matrix = models.ForeignKey(
        CouvertureUsageMatrix, on_delete=models.PROTECT, null=True, blank=True
    )
    couverture_label = models.CharField(
        "Libellé couverture du sol", max_length=254, blank=True, null=True
    )
    usage_label = models.CharField(
        "Libellé usage du sol", max_length=254, blank=True, null=True
    )
    is_artificial = models.BooleanField("Est artificiel", null=True, blank=True)
    surface = models.DecimalField(
        "surface", max_digits=15, decimal_places=4, blank=True, null=True
    )

    mpoly = models.MultiPolygonField()

    default_property = "id"
    mapping = {
        "couverture": "couverture",
        "usage": "usage",
        "millesime": "millesime",
        "source": "source",
        "origine": "origine",
        "origine2": "origine2",
        "ossature": "ossature",
        "commentaire": "commentair",
        "mpoly": "MULTIPOLYGON",
    }

    class Meta:
        indexes = [
            models.Index(fields=["couverture"]),
            models.Index(fields=["usage"]),
        ]

    @classmethod
    def get_groupby(cls, field_group_by, coveredby, year):
        """Return SUM(surface) GROUP BY couverture if coveredby geom.
        Return {
            "CS1.1.1": 678,
            "CS1.1.2": 419,
        }

        Parameters:
        ==========
        * field_group_by: 'couverture' or 'usage'
        * coveredby: polynome of the perimeter in which Ocsge items mut be
        """
        qs = cls.objects.filter(year=year)
        qs = qs.filter(mpoly__intersects=coveredby)
        qs = qs.annotate(intersection=Intersection("mpoly", coveredby))
        qs = qs.annotate(intersection_surface=Area(Transform("intersection", 2154)))
        qs = qs.values(field_group_by).order_by(field_group_by)
        qs = qs.annotate(total_surface=Sum("intersection_surface"))
        # il n'y a pas les hectares dans l'objet area, on doit faire une conversion
        # 1 m² ==> 0,0001 hectare
        data = {_[field_group_by]: _["total_surface"].sq_m / 10000 for _ in qs}
        return data

    @classmethod
    def get_year(cls):
        raise NotImplementedError("Need to be overrided to return a year")

    @classmethod
    def clean_data(cls):
        raise NotImplementedError("Need to be overrided to return a year")

    @classmethod
    def calculate_fields(cls):
        """Override if you need to calculate some fields after loading data.
        By default, it will calculate label for couverture and usage if couverture_field
        and usage_field are set with the name of the field containing code (cs.2.1.3)
        """
        # cls.set_label(CouvertureSol, "couverture", "couverture_label")
        # cls.set_label(UsageSol, "usage", "usage_label")
        cls.objects.all().filter(surface__isnull=True).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                models.DecimalField(max_digits=15, decimal_places=4),
            )
        )

    @classmethod
    def set_label(cls, klass, field_code, field_label):
        """Set label field using CouvertureSol or UsageSol référentiel.

        Parameters:
        ===========
        * klass: CouvertureSol or UsageSol
        * field_code: name of the field containing the code (eg. us1.1.1)
        * field_label: name of the field where to save the label
        """
        label = klass.objects.filter(code_prefix=OuterRef(field_code))
        label = label.values("label")[:1]
        update_kwargs = {field_label: Subquery(label)}
        filter_kwargs = {f"{field_label}__isnull": True}
        cls.objects.all().filter(**filter_kwargs).update(**update_kwargs)


class OcsgeDiff(TruncateTableMixin, DataColorationMixin, models.Model):
    year_old = models.IntegerField(
        "Ancienne année", validators=[MinValueValidator(2000), MaxValueValidator(2050)]
    )
    year_new = models.IntegerField(
        "Nouvelle année", validators=[MinValueValidator(2000), MaxValueValidator(2050)]
    )
    cs_new = models.CharField(
        "Code nouvelle couverture", max_length=12, blank=True, null=True
    )
    cs_old = models.CharField(
        "Code ancienne couverture", max_length=12, blank=True, null=True
    )
    us_new = models.CharField(
        "Code nouveau usage", max_length=12, blank=True, null=True
    )
    us_old = models.CharField("Code ancien usage", max_length=12, blank=True, null=True)
    mpoly = models.MultiPolygonField()

    # calculated fields
    surface = models.DecimalField(
        "surface", max_digits=15, decimal_places=4, blank=True, null=True
    )
    cs_old_label = models.CharField(
        "Ancienne couverture", max_length=254, blank=True, null=True
    )
    us_old_label = models.CharField(
        "Ancien usage", max_length=254, blank=True, null=True
    )
    cs_new_label = models.CharField(
        "Nouvelle couverture", max_length=254, blank=True, null=True
    )
    us_new_label = models.CharField(
        "Nouveau usage", max_length=254, blank=True, null=True
    )
    old_is_artif = models.BooleanField(blank=True, null=True)
    new_is_artif = models.BooleanField(blank=True, null=True)
    is_new_artif = models.BooleanField(blank=True, null=True)
    is_new_natural = models.BooleanField(blank=True, null=True)
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

    default_property = "surface"
    default_color = "Red"


class ZoneConstruite(TruncateTableMixin, DataColorationMixin, models.Model):
    id_source = models.CharField("ID Source", max_length=200)
    millesime = models.CharField("Millesime", max_length=200)
    mpoly = models.MultiPolygonField()
    # calculated
    year = models.IntegerField(
        "Année",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
        null=True,
        blank=True,
    )
    surface = models.DecimalField(
        "surface", max_digits=15, decimal_places=4, blank=True, null=True
    )

    @classmethod
    def calculate_fields(cls):
        """Set year field"""
        cls.objects.filter(year__isnull=True).update(
            year=Cast("millesime", output_field=models.IntegerField())
        )
        cls.objects.filter(surface__isnull=True).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                models.DecimalField(max_digits=15, decimal_places=4),
            )
        )
