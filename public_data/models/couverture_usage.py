"""
Ce fichier contient les référentiels CouvertureSol et UsageSol qui sont les deux
types d'analyse fournies par l'OCSGE.
"""
from functools import cache

from django.db import models


class BaseSolManager(models.Manager):
    def get_by_natural_key(self, code):
        return self.get(code=code)


class BaseSol(models.Model):
    class Meta:
        abstract = True

    code_prefix = models.CharField("Nomenclature préfixée", max_length=10, unique=True)
    code = models.CharField("Nomenclature", max_length=8, unique=True)
    label = models.CharField("Libellé", max_length=250)
    label_short = models.CharField("Libellé court", max_length=50, blank=True, null=True)
    map_color = models.CharField("Couleur", max_length=8, blank=True, null=True)
    is_key = models.BooleanField("Est déterminant", default=False)

    objects = BaseSolManager()

    def natural_key(self) -> str:
        return (self.code,)

    def get_label_short(self):
        if not self.label_short:
            return self.label[:50]
        return self.label_short

    @property
    def level(self) -> int:
        """Return the level of the instance in the tree
        CS1 => 1
        CS1.1 => 2
        CS1.1.1.1 => 4
        """
        return len(self.code.split("."))

    @property
    def code_prefix_class(self):
        return self.code_prefix.replace(".", "_")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.total_surface = dict()  # TODO: remove

    @property
    def parent(self):
        raise NotImplementedError("Needs to be overridden")

    def __str__(self):
        return f"{self.code_prefix} {self.label}"


class UsageSol(BaseSol):
    prefix = "US"
    parent = models.ForeignKey(
        "UsageSol",
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name="children",
    )

    @classmethod
    def get_leafs(cls):
        return cls.objects.filter(
            code__in=[
                "1.1",
                "1.2",
                "1.3",
                "1.4",
                "1.5",
                "2",
                "235",
                "3",
                "4.1.1",
                "4.1.2",
                "4.1.3",
                "4.1.4",
                "4.1.5",
                "4.2",
                "4.3",
                "5",
                "6.1",
                "6.2",
                "6.3",
                "6.6",
            ]
        )


class CouvertureSol(BaseSol):
    prefix = "CS"
    parent = models.ForeignKey(
        "CouvertureSol",
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name="children",
    )

    @classmethod
    def get_leafs(cls):
        return cls.objects.filter(
            code__in=[
                "1.1.1.1",
                "1.1.1.2",
                "1.1.2.1",
                "1.1.2.2",
                "1.2.1",
                "1.2.2",
                "1.2.3",
                "2.1.1.1",
                "2.1.1.2",
                "2.1.1.3",
                "2.1.2",
                "2.1.3",
                "2.2.1",
                "2.2.2",
            ]
        )


class CouvertureUsageMatrixManager(models.Manager):
    def get_by_natural_key(self, couverture, usage):
        return self.get(couverture__code=couverture, usage__code=usage)


class CouvertureUsageMatrix(models.Model):
    class LabelChoices(models.TextChoices):
        ARTIFICIAL = "ARTIF", "Artificiel"
        CONSUMED = "CONSU", "Consommé"
        NAF = "NAF", "NAF"
        ARTIF_NOT_CONSUMED = "ARTIF_NOT_CONSU", "Artificiel non consommé"
        NONE = "NONE", "Non renseigné"

    couverture = models.ForeignKey("CouvertureSol", on_delete=models.PROTECT)
    usage = models.ForeignKey("UsageSol", on_delete=models.PROTECT)
    is_artificial = models.BooleanField("Artificiel", default=False)
    label = models.CharField(
        "Libellé",
        max_length=20,
        choices=LabelChoices.choices,
        default=LabelChoices.NONE,
    )

    objects = CouvertureUsageMatrixManager()

    def natural_key(self):
        return self.couverture.code, self.usage.code

    class Meta:
        unique_together = (("couverture", "usage"),)
        constraints = [
            models.UniqueConstraint(fields=["couverture", "usage"], name="matrix-couverture-usage-unique"),
        ]
        indexes = [
            models.Index(fields=["is_artificial"], name="matrix-is_artificial-index"),
        ]

    def __str__(self) -> str:
        us = self.usage.code_prefix if self.usage else "None"
        cs = self.couverture.code_prefix if self.couverture else "None"
        a = "a" if self.is_artificial else ""
        return f"{cs}-{us}:{a}"

    @classmethod
    @cache
    def matrix_dict(cls):
        _matrix_dict = dict()

        for item in cls.objects.all().select_related("usage", "couverture"):
            key = (
                item.couverture.code_prefix if item.couverture else None,
                item.usage.code_prefix if item.usage else None,
            )
            _matrix_dict[key] = item

        return _matrix_dict
