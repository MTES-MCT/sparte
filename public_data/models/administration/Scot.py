from django.contrib.gis.db import models
from django.contrib.postgres.search import TrigramSimilarity

from public_data.models.cerema import Cerema
from public_data.models.enums import SRID
from utils.db import IntersectManager

from .AdminRef import AdminRef
from .GetDataFromCeremaMixin import GetDataFromCeremaMixin
from .LandMixin import LandMixin


class Scot(LandMixin, GetDataFromCeremaMixin, models.Model):
    class Meta:
        managed = False

    name = models.CharField("Nom", max_length=250)
    mpoly = models.MultiPolygonField(srid=4326, null=True, blank=True)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    regions = models.ManyToManyField("Region")
    departements = models.ManyToManyField("Departement")
    siren = models.CharField("Siren", max_length=12, null=True, blank=True)

    objects = IntersectManager()

    land_type = AdminRef.SCOT
    default_analysis_level = AdminRef.EPCI

    @property
    def official_id(self) -> str:
        return self.siren

    def get_qs_cerema(self):
        return Cerema.objects.filter(city_insee__in=self.commune_set.values("insee"))

    def get_cities(self):
        return self.commune_set.all()

    def __str__(self):
        return self.name.upper()

    def get_official_id(self) -> str:
        return self.siren if self.siren is not None else ""

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        qs = cls.objects.annotate(similarity=TrigramSimilarity("name", needle))
        qs = qs.filter(similarity__gt=0.15)  # Filtrer par un score minimum de similarité
        qs = qs.order_by("-similarity")  # Trier par score décroissant

        if region:
            qs = qs.filter(regions=region)
        if departement:
            qs = qs.filter(id=departement.id)

        return qs
