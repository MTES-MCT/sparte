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

from django.contrib.gis.db import models
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Sum, Q
from django.utils.functional import cached_property

from .cerema import Cerema
from .mixins import DataColorationMixin


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
    @cached_property
    def area(self):
        """Return surface of the land in Ha"""
        return self.mpoly.transform(2154, clone=True).area / (100 ** 2)

    @classmethod
    def search(cls, needle):
        qs = cls.objects.filter(name__icontains=needle)
        qs = qs.order_by("name")
        return qs


class Region(LandMixin, GetDataFromCeremaMixin, models.Model):
    source_id = models.CharField("Identifiant source", max_length=2)
    name = models.CharField("Nom", max_length=27)
    mpoly = models.MultiPolygonField()

    def get_ocsge_millesimes(self) -> set:
        return {
            millesime
            for dept in self.departement_set.all()
            for millesime in dept.get_ocsge_millesimes()
        }

    @property
    def public_key(self):
        return f"REGION_{self.id}"

    @property
    def is_artif_ready(self):
        is_artif_ready = True
        for dept in self.departement_set.all():
            is_artif_ready &= dept.is_artif_ready
        return is_artif_ready

    def get_qs_cerema(self):
        return Cerema.objects.filter(region_id=self.source_id)

    def __str__(self):
        return self.name


class Departement(LandMixin, GetDataFromCeremaMixin, models.Model):
    source_id = models.CharField("Identifiant source", max_length=3)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    is_artif_ready = models.BooleanField("Données artif disponibles", default=False)
    ocsge_millesimes = models.CharField(
        "Millesimes OCSGE dispo", max_length=100, null=True
    )
    name = models.CharField("Nom", max_length=23)
    mpoly = models.MultiPolygonField()

    @property
    def public_key(self):
        return f"DEPART_{self.id}"

    def get_ocsge_millesimes(self) -> set:
        """Return the list of all OCSGE millesimes (years) available for this dept."""
        if not self.ocsge_millesimes:
            return list()
        matches = re.finditer(r"([\d]{4,4})", self.ocsge_millesimes)
        return {int(m.group(0)) for m in matches}

    def get_qs_cerema(self):
        return Cerema.objects.filter(dept_id=self.source_id)

    def __str__(self):
        return self.name


class Epci(LandMixin, GetDataFromCeremaMixin, models.Model):
    source_id = models.CharField("Identifiant source", max_length=9)
    name = models.CharField("Nom", max_length=64)
    mpoly = models.MultiPolygonField()
    departements = models.ManyToManyField(Departement)

    def get_ocsge_millesimes(self) -> set:
        return {
            millesime
            for dept in self.departements.all()
            for millesime in dept.get_ocsge_millesimes()
        }

    @property
    def public_key(self):
        return f"EPCI_{self.id}"

    @property
    def is_artif_ready(self):
        is_artif_ready = True
        for dept in self.departements.all():
            is_artif_ready &= dept.is_artif_ready
        return is_artif_ready

    def get_qs_cerema(self):
        return Cerema.objects.filter(epci_id=self.source_id)

    def __str__(self):
        return self.name


class Commune(DataColorationMixin, LandMixin, GetDataFromCeremaMixin, models.Model):
    insee = models.CharField("Code INSEE", max_length=5)
    name = models.CharField("Nom", max_length=45)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE)
    epci = models.ForeignKey(Epci, on_delete=models.CASCADE)
    mpoly = models.MultiPolygonField()
    # Calculated fields
    map_color = models.CharField(
        "Couleur d'afficgage", max_length=30, null=True, blank=True
    )
    # area_consumed = models.DecimalField(
    #     "Surface consommée", max_digits=10, decimal_places=2, null=True, blank=True
    # )
    # area_artificial = models.DecimalField(
    #     "Surface artificielle", max_digits=10, decimal_places=2, null=True, blank=True
    # )
    # area_naf = models.DecimalField(
    #     "Surface naturelle", max_digits=10, decimal_places=2, null=True, blank=True
    # )
    # last_year_ocsge = models.IntegerField("Dernier millésime disponible")

    # DataColorationMixin properties that need to be set when heritating
    default_property = "insee"  # need to be set correctly to work
    default_color = "Yellow"

    @property
    def public_key(self):
        return f"COMMUNE_{self.id}"

    @property
    def is_artif_ready(self):
        return self.departement.is_artif_ready

    def get_qs_cerema(self):
        return Cerema.objects.filter(city_insee=self.insee)

    def __str__(self):
        return f"{self.name} ({self.insee})"

    def get_ocsge_millesimes(self) -> set:
        return self.departement.get_ocsge_millesimes()

    @classmethod
    def search(cls, needle):
        qs = cls.objects.filter(Q(name__icontains=needle) | Q(insee__icontains=needle))
        qs = qs.order_by("name")
        return qs

    @classmethod
    def get_property_data(cls, property_name=None):
        qs = cls.objects.all()
        qs = qs.values_list(property_name, flat=True)
        qs = qs.order_by(property_name)
        return [(int(x),) for x in qs if x.isdigit()]


class Land:
    """It's a generic class to work with Epci, Departement, Region or Commune.
    Like a proxy."""

    class Meta:
        subclasses = {
            "COMMUNE": Commune,
            "EPCI": Epci,
            "DEPART": Departement,
            "REGION": Region,
        }

    def __init__(self, public_key):
        self.public_key = public_key
        self.land_type, self.id = public_key.strip().split("_")
        klass = self.get_land_class(self.land_type)
        try:
            self.land = klass.objects.get(pk=int(self.id))
        except ObjectDoesNotExist as e:
            raise Exception(f"Public key '{id}' unknown") from e

    def get_conso_per_year(self, start="2010", end="2020", coef=1):
        return self.land.get_conso_per_year(start, end, coef)

    def __getattr__(self, name):
        return getattr(self.land, name)

    def __str__(self):
        return f"Land({str(self.land)})"

    @classmethod
    def get_land_class(cls, land_type):
        return cls.Meta.subclasses[land_type.upper()]

    @classmethod
    def search(cls, needle):
        """Search for a keyword on all land subclasses"""
        return {
            name: subclass.search(needle)
            for name, subclass in cls.Meta.subclasses.items()
        }
