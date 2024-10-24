from django.apps import apps
from django.contrib.gis.db import models
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models.functions import Lower

from public_data.models.enums import SRID
from utils.db import IntersectManager

from .AdminRef import AdminRef
from .GetDataFromCeremaMixin import GetDataFromCeremaMixin
from .LandMixin import LandMixin


class EpciManager(IntersectManager):
    def get_by_natural_key(self, source_id):
        return self.get(source_id=source_id)


class Epci(LandMixin, GetDataFromCeremaMixin, models.Model):
    class Meta:
        verbose_name = "EPCI"
        managed = False

    source_id = models.CharField(
        "Identifiant source",
        max_length=50,
        primary_key=True,
    )
    name = models.CharField("Nom", max_length=70)
    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )
    departements = models.ManyToManyField(to="Departement")

    objects = EpciManager()

    land_type = AdminRef.EPCI
    land_type_label = AdminRef.CHOICES_DICT[land_type]
    default_analysis_level = AdminRef.COMMUNE

    @property
    def official_id(self) -> str:
        return self.source_id

    def get_ocsge_millesimes(self) -> set:
        millesimes = set()
        for dept in self.departements.all():
            millesimes.update(dept.ocsge_millesimes)
        return millesimes

    @property
    def is_artif_ready(self):
        is_artif_ready = True
        for dept in self.departements.all():
            is_artif_ready &= dept.is_artif_ready
        return is_artif_ready

    def get_qs_cerema(self):
        return apps.get_model("public_data.Cerema").objects.filter(epci_ids__contains=[self.source_id])

    def get_cities(self):
        return self.commune_set.all()

    def __str__(self):
        return self.name

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        qs = cls.objects.annotate(similarity=TrigramSimilarity(Lower("name__unaccent"), needle.lower()))
        qs = qs.filter(similarity__gt=0.15)  # Filtrer par un score minimum de similarité
        qs = qs.order_by("-similarity")  # Trier par score décroissant

        if region:
            qs = qs.filter(departements__region=region)
        if departement:
            qs = qs.filter(departements__id=departement.id)
        if epci:
            qs = qs.filter(id=epci.id)

        qs = qs.distinct().order_by("-similarity")

        return qs
