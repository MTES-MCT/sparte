from django.contrib.gis.db import models
from django.contrib.postgres.fields import ArrayField

from public_data.models.cerema import Cerema
from public_data.models.enums import SRID
from utils.db import IntersectManager

from .AdminRef import AdminRef
from .GetDataFromCeremaMixin import GetDataFromCeremaMixin
from .LandMixin import LandMixin


class Departement(LandMixin, GetDataFromCeremaMixin, models.Model):
    class Meta:
        verbose_name = "Département"
        managed = False

    source_id = models.CharField("Identifiant source", max_length=50)
    region = models.ForeignKey("Region", on_delete=models.CASCADE)
    is_artif_ready = models.BooleanField("Données artif disponibles", default=False)
    ocsge_millesimes = ArrayField(models.IntegerField(), null=True, blank=True)
    name = models.CharField("Nom", max_length=50)
    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    objects = IntersectManager()

    land_type = AdminRef.DEPARTEMENT
    default_analysis_level = AdminRef.SCOT

    @property
    def official_id(self) -> str:
        return self.source_id

    def get_qs_cerema(self):
        return Cerema.objects.filter(dept_id=self.source_id)

    def get_cities(self):
        return self.commune_set.all()

    def __str__(self):
        return f"{self.source_id} - {self.name}"

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        qs = cls.objects.filter(name__unaccent__trigram_word_similar=needle)
        if region:
            qs = qs.filter(region=region)
        if departement:
            qs = qs.filter(id=departement.id)
        qs = qs.order_by("name")
        return qs
