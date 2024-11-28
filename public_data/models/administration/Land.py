from typing import List

from django.contrib.gis.db import models
from django.core.exceptions import ObjectDoesNotExist
from django.db.models.query import QuerySet

from public_data.exceptions import LandException

from .AdminRef import AdminRef
from .Commune import Commune
from .Departement import Departement
from .Epci import Epci
from .Nation import Nation
from .Region import Region
from .Scot import Scot


class Land:
    """It's a generic class to work with Epci, Departement, Region or Commune.
    Like a proxy."""

    class Meta:
        subclasses = {
            AdminRef.COMMUNE: Commune,
            AdminRef.EPCI: Epci,
            AdminRef.SCOT: Scot,
            AdminRef.DEPARTEMENT: Departement,
            AdminRef.REGION: Region,
            AdminRef.NATION: Nation,
        }

    def __init__(self, public_key):
        self.public_key = public_key
        self.land_type: str
        self.id: str
        self.land: Commune | Epci | Scot | Departement | Region | Nation

        if public_key == "NATION_NATION":
            nation = Nation()
            self.land_type = nation.land_type
            self.id = nation.source_id
            self.land = nation
            return

        try:
            self.land_type, self.id = public_key.strip().split("_")
        except ValueError as e:
            raise LandException("Clé du territoire mal formatée", e)
        try:
            klass = self.get_land_class(self.land_type)
        except KeyError:
            raise LandException("Territoire inconnu.", public_key)
        try:
            self.land = klass.objects.get_by_natural_key(str(self.id))
        except ObjectDoesNotExist as e:
            raise LandException(f"Public key '{self.id}' unknown") from e

    def get_conso_per_year(self, start="2010", end="2020", coef=1):
        return self.land.get_conso_per_year(start, end, coef)

    def get_cities(self) -> QuerySet[Commune]:
        return self.land.get_cities()

    @property
    def area(self):
        return self.land.area

    @property
    def mpoly(self):
        return self.land.mpoly

    @property
    def land_type_label(self):
        return AdminRef.CHOICES_DICT[self.land_type]

    @property
    def name(self):
        return self.land.name

    def __str__(self):
        return f"Land({str(self.land)})"

    @property
    def official_id(self) -> str:
        return self.land.official_id

    @classmethod
    def get_lands(cls, public_keys):
        if not isinstance(public_keys, list):
            public_keys = [public_keys]
        return [Land(pk) for pk in public_keys]

    @classmethod
    def get_land_class(cls, land_type):
        return cls.Meta.subclasses[land_type.upper()]

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None, search_for=None) -> List[models.Model]:
        """Search for a keyword on all land subclasses and return a flat list of results ordered by similarity"""
        if not search_for:
            return []

        if search_for == "*":
            search_for = cls.Meta.subclasses.keys()

        results = []
        for name, subclass in cls.Meta.subclasses.items():
            if name in search_for:
                subclass_results = subclass.search(needle, region=region, departement=departement, epci=epci)
                results.extend(subclass_results)

        results = sorted(results, key=lambda x: x.similarity, reverse=True)  # Tri par similarité
        return results[:20]  # Limiter à 20 résultats
