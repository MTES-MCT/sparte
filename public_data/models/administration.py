"""
Ce fichier contient les modèles décrivant l'organisation administrative de la France
. Region
. EPCI
. Departement
. Commune

A venir :
. SCOT


class Land
==========

C'est une classe qui se réfère à un territoire sans que l'on ait à connaître son niveau
administratif exacte. Derrière un land peut se cacher une commune, un epci...
C'est un moyen de manipuler tous les niveaux administratifs de la même façon.

Afin de se référer à un Land, on utilise un identifiant unique :
    public_key is a way to refere to a land without knowing exactly what class
    it is. It is build as [level]_[id]. Each level is a model described below.
    Here the following level available:
    EPCI_[ID]
    DEPART_[ID] (département)
    REGION_[ID]
    COMMUNE_[ID]
"""
import re
from typing import Literal

from django.contrib.gis.db import models
from django.core.exceptions import ObjectDoesNotExist
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Sum, Q
from django.utils.functional import cached_property

from utils.db import IntersectManager

from .cerema import Cerema
from .couverture_usage import CouvertureUsageMatrix
from .mixins import DataColorationMixin


class LandException(BaseException):
    pass


class AdminRef:
    REGION = "REGION"
    DEPARTEMENT = "DEPART"
    EPCI = "EPCI"
    COMMUNE = "COMM"
    SCOT = "SCOT"
    COMPOSITE = "COMP"

    CHOICES = (
        (COMMUNE, "Commune"),
        (EPCI, "EPCI"),
        (DEPARTEMENT, "Département"),
        (REGION, "Région"),
        (COMPOSITE, "Composite"),
    )

    CHOICES_DICT = {key: value for key, value in CHOICES}

    @classmethod
    def get_label(cls, key):
        return cls.CHOICES_DICT[key]

    @classmethod
    def get_form_choices(cls, status_list):
        result = list()
        for status in status_list:
            for key, value in cls.CHOICES:
                if status == key:
                    result.append((key, value))
                    break
        return result

    @classmethod
    def get_class(cls, name):
        if name == cls.REGION:
            return Region
        elif name == cls.DEPARTEMENT:
            return Departement
        elif name == cls.EPCI:
            return Epci
        elif name == cls.COMMUNE:
            return Commune
        elif name == cls.SCOT:
            pass
        raise AttributeError(f"{name} is not an administrative layer")

    @classmethod
    def get_analysis_default_level(cls, level):
        default_analysis = {
            cls.COMMUNE: cls.COMMUNE,
            cls.EPCI: cls.COMMUNE,
            cls.DEPARTEMENT: cls.EPCI,
            cls.REGION: cls.DEPARTEMENT,
            cls.COMPOSITE: cls.COMMUNE,
        }
        return default_analysis[level]

    @classmethod
    def get_admin_level(cls, type_list):
        if not isinstance(type_list, set):
            type_list = {_ for _ in type_list}
        if len(type_list) == 1:
            return type_list.pop()
        else:
            return cls.COMPOSITE

    @classmethod
    def get_available_analysis_level(cls, land_type):
        available = {
            cls.COMMUNE: [cls.COMMUNE],
            cls.EPCI: [cls.COMMUNE],
            cls.DEPARTEMENT: [
                cls.COMMUNE,
                cls.EPCI,
            ],
            cls.REGION: [
                cls.COMMUNE,
                cls.EPCI,
                cls.DEPARTEMENT,
            ],
            cls.COMPOSITE: [
                cls.COMMUNE,
                cls.EPCI,
                cls.DEPARTEMENT,
                cls.REGION,
            ],
        }
        return available[land_type]

    @classmethod
    def get_default_analysis_level(cls, type_list):
        """When we have a group of lands, the smallest analysis level is selected
        REGION > DEPARTEMENT > EPCI > COMMUNE
        """
        if isinstance(type_list, str):
            type_list = [
                type_list,
            ]
        elif not isinstance(type_list, list):
            type_list = list(type_list)
        if cls.COMMUNE in type_list:
            return cls.COMMUNE
        elif cls.EPCI in type_list:
            return cls.EPCI
        elif cls.DEPARTEMENT in type_list:
            return cls.DEPARTEMENT
        elif cls.REGION in type_list:
            return cls.REGION
        else:
            return cls.COMMUNE


class GetDataFromCeremaMixin:
    def get_qs_cerema(self):
        raise NotImplementedError("Need to be specified in child")

    def get_conso_per_year(self, start="2010", end="2020", coef=1):
        """Return Cerema data for the city, transposed and named after year"""
        fields = Cerema.get_art_field(start, end)
        qs = self.get_qs_cerema()
        args = (Sum(field) for field in fields)
        qs = qs.aggregate(*args)
        return {f"20{key[3:5]}": val * coef / 10000 for key, val in qs.items()}


class LandMixin:
    @property
    def public_key(self):
        return f"{self.land_type}_{self.id}"

    @cached_property
    def area(self):
        """Return surface of the land in Ha"""
        return self.mpoly.transform(2154, clone=True).area / 10000

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        raise NotImplementedError("need to be overrided")

    def get_qs_cerema(self):
        raise NotImplementedError("need to be overrided")

    def get_cities(self):
        raise NotImplementedError("need to be overrided")

    def get_pop_change_per_year(
        self,
        start: str = "2010",
        end: str = "2020",
        criteria: Literal["pop", "household"] = "pop",
    ):
        cities = (
            CommunePop.objects.filter(city__in=self.get_cities())
            .filter(year__gte=start, year__lte=end)
            .values("year")
            .annotate(pop_progression=Sum("pop_change"))
            .annotate(household_progression=Sum("household_change"))
            .order_by("year")
        )
        if criteria == "pop":
            data = {city["year"]: city["pop_progression"] for city in cities}
        else:
            data = {city["year"]: city["household_progression"] for city in cities}
        return {
            str(year): data.get(year, None) for year in range(int(start), int(end) + 1)
        }


class Region(LandMixin, GetDataFromCeremaMixin, models.Model):
    source_id = models.CharField("Identifiant source", max_length=50)
    name = models.CharField("Nom", max_length=50)
    mpoly = models.MultiPolygonField()

    objects = IntersectManager()

    land_type = AdminRef.REGION
    default_analysis_level = AdminRef.DEPARTEMENT

    def get_ocsge_millesimes(self) -> set:
        return {
            millesime
            for dept in self.departement_set.all()
            for millesime in dept.get_ocsge_millesimes()
        }

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        qs = cls.objects.filter(name__icontains=needle)
        if region:
            qs = qs.filter(id=region.id)
        qs = qs.order_by("name")
        return qs

    @property
    def is_artif_ready(self):
        is_artif_ready = True
        for dept in self.departement_set.all():
            is_artif_ready &= dept.is_artif_ready
        return is_artif_ready

    def get_qs_cerema(self):
        return Cerema.objects.filter(region_id=self.source_id)

    def get_cities(self):
        return Commune.objects.filter(departement__region=self)

    def __str__(self):
        return self.name


class Departement(LandMixin, GetDataFromCeremaMixin, models.Model):
    source_id = models.CharField("Identifiant source", max_length=50)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    is_artif_ready = models.BooleanField("Données artif disponibles", default=False)
    ocsge_millesimes = models.CharField(
        "Millesimes OCSGE dispo", max_length=100, null=True
    )
    name = models.CharField("Nom", max_length=50)
    mpoly = models.MultiPolygonField()

    objects = IntersectManager()

    land_type = AdminRef.DEPARTEMENT
    default_analysis_level = AdminRef.EPCI

    def get_ocsge_millesimes(self) -> set:
        """Return the list of all OCSGE millesimes (years) available for this dept."""
        if not self.ocsge_millesimes:
            return list()
        matches = re.finditer(r"([\d]{4,4})", self.ocsge_millesimes)
        return {int(m.group(0)) for m in matches}

    def get_qs_cerema(self):
        return Cerema.objects.filter(dept_id=self.source_id)

    def get_cities(self):
        return self.commune_set.all()

    def __str__(self):
        return self.name

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        qs = cls.objects.filter(name__icontains=needle)
        if region:
            qs = qs.filter(region=region)
        if departement:
            qs = qs.filter(id=departement.id)
        qs = qs.order_by("name")
        return qs


class Epci(LandMixin, GetDataFromCeremaMixin, models.Model):
    source_id = models.CharField("Identifiant source", max_length=50)
    name = models.CharField("Nom", max_length=70)
    mpoly = models.MultiPolygonField()
    departements = models.ManyToManyField(Departement)

    objects = IntersectManager()

    land_type = AdminRef.EPCI
    default_analysis_level = AdminRef.COMMUNE

    def get_ocsge_millesimes(self) -> set:
        return {
            millesime
            for dept in self.departements.all()
            for millesime in dept.get_ocsge_millesimes()
        }

    @property
    def is_artif_ready(self):
        is_artif_ready = True
        for dept in self.departements.all():
            is_artif_ready &= dept.is_artif_ready
        return is_artif_ready

    def get_qs_cerema(self):
        return Cerema.objects.filter(epci_id=self.source_id)

    def get_cities(self):
        return self.commune_set.all()

    def __str__(self):
        return self.name

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        qs = cls.objects.filter(name__icontains=needle)
        if region:
            qs = qs.filter(departements__region=region)
        if departement:
            qs = qs.filter(departements__id=departement.id)
        if epci:
            qs = qs.filter(id=epci.id)
        qs = qs.distinct().order_by("name")
        return qs


class Commune(DataColorationMixin, LandMixin, GetDataFromCeremaMixin, models.Model):
    insee = models.CharField("Code INSEE", max_length=7)
    name = models.CharField("Nom", max_length=50)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE)
    epci = models.ForeignKey(Epci, on_delete=models.CASCADE)
    mpoly = models.MultiPolygonField()

    objects = IntersectManager()

    # Calculated fields
    map_color = models.CharField(
        "Couleur d'affichage", max_length=30, null=True, blank=True
    )
    last_millesime = models.IntegerField(
        "Dernier millésime disponible",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
        blank=True,
        null=True,
    )
    surface_artif = models.DecimalField(
        "Surface artificielle",
        max_digits=15,
        decimal_places=4,
        blank=True,
        null=True,
    )

    # DataColorationMixin properties that need to be set when heritating
    default_property = "insee"  # need to be set correctly to work
    default_color = "Yellow"
    land_type = AdminRef.COMMUNE
    default_analysis_level = AdminRef.COMMUNE

    @property
    def is_artif_ready(self):
        return self.departement.is_artif_ready

    def get_qs_cerema(self):
        return Cerema.objects.filter(city_insee=self.insee)

    def __str__(self):
        return f"{self.name} ({self.insee})"

    def get_ocsge_millesimes(self) -> set:
        return self.departement.get_ocsge_millesimes()

    def get_cities(self):
        return [self]

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        qs = cls.objects.filter(Q(name__icontains=needle) | Q(insee__icontains=needle))
        if region:
            qs = qs.filter(departement__region=region)
        if departement:
            qs = qs.filter(departement=departement)
        if epci:
            qs = qs.filter(epci=epci)
        qs = qs.order_by("name")
        return qs

    @classmethod
    def get_property_data(cls, property_name=None):
        qs = cls.objects.all()
        qs = qs.values_list(property_name, flat=True)
        qs = qs.order_by(property_name)
        return [(int(x),) for x in qs if x.isdigit()]


class CommuneDiff(models.Model):
    city = models.ForeignKey(Commune, verbose_name="Commune", on_delete=models.CASCADE)
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


class CommuneSol(models.Model):
    city = models.ForeignKey(Commune, verbose_name="Commune", on_delete=models.CASCADE)
    year = models.IntegerField(
        "Millésime",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
    )
    matrix = models.ForeignKey(CouvertureUsageMatrix, on_delete=models.CASCADE)
    surface = models.DecimalField(
        "Surface", max_digits=15, decimal_places=4, blank=True, null=True
    )

    class Meta:
        indexes = [
            models.Index(
                name="communesol-triplet-index", fields=["city", "matrix", "year"]
            ),
            models.Index(name="communesol-city-index", fields=["city"]),
            models.Index(name="communesol-year-index", fields=["year"]),
            models.Index(name="communesol-matrix-index", fields=["matrix"]),
        ]


class CommunePop(models.Model):
    city = models.ForeignKey(
        Commune, verbose_name="Commune", on_delete=models.CASCADE, related_name="pop"
    )
    year = models.IntegerField(
        "Millésime",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
    )
    pop = models.IntegerField("Population", blank=True, null=True)
    pop_change = models.IntegerField("Population", blank=True, null=True)
    household = models.IntegerField("Nb ménages", blank=True, null=True)
    household_change = models.IntegerField("Population", blank=True, null=True)


class Land:
    """It's a generic class to work with Epci, Departement, Region or Commune.
    Like a proxy."""

    class Meta:
        subclasses = {
            AdminRef.COMMUNE: Commune,
            AdminRef.EPCI: Epci,
            AdminRef.DEPARTEMENT: Departement,
            AdminRef.REGION: Region,
        }

    def __init__(self, public_key):
        self.public_key = public_key
        try:
            self.land_type, self.id = public_key.strip().split("_")
        except ValueError:
            raise LandException("Clé du territoire mal formatée")
        if not self.id.isdigit():
            raise LandException("ID n'est pas un entier correcte.")
        try:
            klass = self.get_land_class(self.land_type)
        except KeyError:
            raise LandException("Territoire inconnu.")
        try:
            self.land = klass.objects.get(pk=int(self.id))
        except ObjectDoesNotExist as e:
            raise Exception(f"Public key '{id}' unknown") from e

    def get_conso_per_year(self, start="2010", end="2020", coef=1):
        return self.land.get_conso_per_year(start, end, coef)

    def get_cities(self):
        return self.land.get_cities()

    def __getattr__(self, name):
        return getattr(self.land, name)

    def __str__(self):
        return f"Land({str(self.land)})"

    @classmethod
    def get_lands(cls, public_keys):
        if not isinstance(public_keys, list):
            public_keys = [public_keys]
        return [Land(pk) for pk in public_keys]

    @classmethod
    def get_default_analysis_level(cls, lands):
        """When we have a group of lands, the smallest analysis level is selected
        REGION > DEPARTEMENT > EPCI > COMMUNE
        """
        available = {land.default_analysis_level for land in lands}
        return AdminRef.get_default_analysis_level(available)

    @classmethod
    def get_land_class(cls, land_type):
        return cls.Meta.subclasses[land_type.upper()]

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None, search_for=None):
        """Search for a keyword on all land subclasses"""
        if not search_for:
            return dict()
        return {
            name: subclass.search(
                needle, region=region, departement=departement, epci=epci
            )
            for name, subclass in cls.Meta.subclasses.items()
            if name in search_for
        }
