from typing import Dict

from django.contrib.gis.db import models
from django.core.exceptions import ObjectDoesNotExist

from public_data.exceptions import LandException

from .AdminRef import AdminRef
from .Commune import Commune
from .Departement import Departement
from .Epci import Epci
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
        }

    def __init__(self, public_key):
        self.public_key = public_key

        try:
            self.land_type, self.id = public_key.strip().split("_")
        except ValueError as e:
            raise LandException("Clé du territoire mal formatée", e)
        if not self.id.isdigit():
            raise LandException("ID n'est pas un entier correcte.")
        try:
            klass = self.get_land_class(self.land_type)
        except KeyError:
            raise LandException("Territoire inconnu.")
        try:
            self.land = klass.objects.get(pk=int(self.id))
        except ObjectDoesNotExist as e:
            raise LandException(f"Public key '{self.id}' unknown") from e

    def get_conso_per_year(self, start="2010", end="2020", coef=1):
        return self.land.get_conso_per_year(start, end, coef)

    def get_cities(self):
        return self.land.get_cities()

    def __getattr__(self, name):
        return getattr(self.land, name)

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
    def search(cls, needle, region=None, departement=None, epci=None, search_for=None) -> Dict[str, models.QuerySet]:
        """Search for a keyword on all land subclasses"""
        if not search_for:
            return dict()

        if search_for == "*":
            search_for = cls.Meta.subclasses.keys()

        return {
            name: subclass.search(needle, region=region, departement=departement, epci=epci)
            for name, subclass in cls.Meta.subclasses.items()
            if name in search_for
        }
