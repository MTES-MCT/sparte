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
from django.db import connection
from django.db.models import Sum
from django.db.models.functions import Cast

from .mixins import AutoLoadMixin, DataColorationMixin

from .couverture_usage import CouvertureSol, UsageSol


class Ocsge(AutoLoadMixin, DataColorationMixin, models.Model):
    couverture = models.CharField(
        "Couverture du sol", max_length=254, blank=True, null=True
    )
    usage = models.CharField("Usage du sol", max_length=254, blank=True, null=True)
    # TODO is_artificial = models.IntegerField("Sureface artificialisée", null=True)
    millesime = models.DateField("Millésime", blank=True, null=True)
    source = models.CharField("Source", max_length=254, blank=True, null=True)
    origine = models.CharField("Origine", max_length=254, blank=True, null=True)
    origine2 = models.CharField("Origine1", max_length=254, blank=True, null=True)
    ossature = models.IntegerField("Ossature", blank=True, null=True)
    commentaire = models.CharField("Commentaire", max_length=254, blank=True, null=True)
    year = models.IntegerField(
        "Année", validators=[MinValueValidator(2000), MaxValueValidator(2050)]
    )
    # Nouveaux champs pour le Gers
    id_source = models.CharField("ID source", max_length=200, blank=True, null=True)
    id_origine = models.CharField("ID origine", max_length=200, blank=True, null=True)
    code_or = models.CharField("Code OR", max_length=200, blank=True, null=True)
    millesime_source = models.CharField(
        "Source du millesime", max_length=200, blank=True, null=True
    )

    # calculated fields
    couverture_label = models.CharField(
        "Libellé couverture du sol", max_length=254, blank=True, null=True
    )
    usage_label = models.CharField(
        "Libellé usage du sol", max_length=254, blank=True, null=True
    )
    map_color = models.CharField("Couleur", max_length=8, blank=True, null=True)

    mpoly = models.MultiPolygonField()

    default_property = "id"
    couverture_field = "couverture"
    usage_field = "usage"
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
        qs = qs.annotate(surface=Area(Transform("intersection", 2154)))
        qs = qs.values(field_group_by).order_by(field_group_by)
        qs = qs.annotate(total_surface=Sum("surface"))
        # il n'y a pas les hectares dans l'objet area, on doit faire une conversion
        # 1 m² ==> 0,0001 hectare
        data = {_[field_group_by]: _["total_surface"].sq_m / (100 ** 2) for _ in qs}
        return data

    @classmethod
    def get_year(cls):
        raise NotImplementedError("Need to be overrided to return a year")

    @classmethod
    def clean_data(cls):
        raise NotImplementedError("Need to be overrided to return a year")


class OcsgeDiff(AutoLoadMixin, DataColorationMixin, models.Model):
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
    oss_old = models.CharField("Ancien OSS", max_length=200, blank=True, null=True)
    oss_new = models.CharField("Nouveau OSS", max_length=200, blank=True, null=True)
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
    is_new_naf = models.BooleanField(blank=True, null=True)

    # shape_file_path = "gers_diff_2016_2019.zip"  # "media/gers/DIFF_2016_2019.zip"
    default_property = "surface"
    default_color = "Red"
    mapping = {
        "cs_new": "CS_nouveau",
        "us_new": "US_nouveau",
        "oss_new": "OSS_nouvea",
        "cs_old": "CS_ancien",
        "us_old": "US_ancien",
        "oss_old": "OSS_ancien",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def calculate_fields(cls):
        """override to hook specific label setting."""
        # update surface field
        cls.objects.all().filter(surface__isnull=True).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                models.DecimalField(max_digits=15, decimal_places=4),
            )
        )
        query = """
        with t as (
        select
            o.id,
            cs_old.label as cs_old_label,
            us_old.label as us_old_label,
            cs_new.label as cs_new_label,
            us_new.label as us_new_label,
            m_old.is_artificial as old_is_artif,
            m_new.is_artificial as new_is_artif,
            m_new.is_artificial = true
            and m_old.is_natural = true as is_new_artif,
            m_old.is_artificial = true
            and m_new.is_natural = true as is_new_naf
        from
            public_data_ocsgediff o
        left join public_data_couverturesol cs_old on
            o.cs_old = cs_old.code_prefix
        left join public_data_usagesol us_old on
            o.us_old = us_old.code_prefix
        inner join public_data_couvertureusagematrix m_old
                on
            m_old.couverture_id = cs_old.id
            and m_old.usage_id = us_old.id
        left join public_data_couverturesol cs_new on
            o.cs_new = cs_new.code_prefix
        left join public_data_usagesol us_new on
            o.us_new = us_new.code_prefix
        inner join public_data_couvertureusagematrix m_new
                on
            m_new.couverture_id = cs_new.id
            and m_new.usage_id = us_new.id
        )
        update
            public_data_ocsgediff o
        set
            cs_old_label = t.cs_old_label,
            us_old_label = t.us_old_label,
            cs_new_label = t.cs_new_label,
            us_new_label = t.us_new_label,
            old_is_artif = t.old_is_artif,
            new_is_artif = t.new_is_artif,
            is_new_artif = t.is_new_artif,
            is_new_naf = t.is_new_naf
        from
            t
        where
            o.id = t.id;
        """
        with connection.cursor() as cursor:
            cursor.execute(query)

    @classmethod
    def set_labels(cls):
        """Set label for cs and us fields."""
        for fieldname in ["cs_old", "us_old", "cs_new", "us_new"]:
            if fieldname.startswith("cs"):
                cls.set_label(CouvertureSol, fieldname, f"{fieldname}_label")
            else:
                cls.set_label(UsageSol, fieldname, f"{fieldname}_label")


class ZoneConstruite(AutoLoadMixin, DataColorationMixin, models.Model):
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

    mapping = {
        "id_source": "ID",
        "millesime": "MILLESIME",
        "mpoly": "MULTIPOLYGON",
    }

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
