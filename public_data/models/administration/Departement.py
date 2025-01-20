from django.contrib.gis.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models.functions import Lower

from public_data.models.enums import SRID
from utils.db import IntersectManager

from .AdminRef import AdminRef
from .GetDataFromCeremaMixin import GetDataFromCeremaMixin
from .LandMixin import LandMixin


class DepartementManager(IntersectManager):
    def get_by_natural_key(self, source_id):
        return self.get(source_id=source_id)


class Departement(LandMixin, GetDataFromCeremaMixin, models.Model):
    class Meta:
        verbose_name = "Département"
        managed = False

    source_id = models.CharField("Identifiant source", max_length=50, primary_key=True)
    region = models.ForeignKey("Region", on_delete=models.CASCADE, to_field="source_id")
    is_artif_ready = models.BooleanField("Données artif disponibles", default=False)
    ocsge_millesimes = ArrayField(models.IntegerField(), null=True, blank=True)
    name = models.CharField("Nom", max_length=50)
    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )
    autorisation_logement_available = models.BooleanField(
        "Statut de disponibilité des données d'autorisation de logement",
        default=False,
    )
    logements_vacants_available = models.BooleanField(
        "Statut de disponibilité des données de logement vacant",
        default=False,
    )

    objects = DepartementManager()

    land_type = AdminRef.DEPARTEMENT
    land_type_label = AdminRef.CHOICES_DICT[land_type]
    default_analysis_level = AdminRef.SCOT

    @property
    def official_id(self) -> str:
        return self.source_id

    def get_cities(self):
        return self.commune_set.all()

    def __str__(self):
        return f"{self.source_id} - {self.name}"

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        qs = cls.objects.annotate(similarity=TrigramSimilarity(Lower("name__unaccent"), needle.lower()))
        qs = qs.filter(similarity__gt=0.15)  # Filtrer par un score minimum de similarité
        qs = qs.order_by("-similarity")  # Trier par score décroissant

        return qs
