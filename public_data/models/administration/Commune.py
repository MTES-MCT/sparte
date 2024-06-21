from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

from public_data.models.cerema import Cerema
from public_data.models.enums import SRID
from public_data.models.mixins import DataColorationMixin
from utils.db import IntersectManager

from .AdminRef import AdminRef
from .GetDataFromCeremaMixin import GetDataFromCeremaMixin
from .LandMixin import LandMixin


class Commune(DataColorationMixin, LandMixin, GetDataFromCeremaMixin, models.Model):
    insee = models.CharField("Code INSEE", max_length=7)
    name = models.CharField("Nom", max_length=50)
    departement = models.ForeignKey("Departement", on_delete=models.PROTECT)
    epci = models.ForeignKey("Epci", on_delete=models.PROTECT, blank=True, null=True)
    scot = models.ForeignKey("Scot", on_delete=models.PROTECT, blank=True, null=True)
    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    objects = IntersectManager()

    # Calculated fields
    map_color = models.CharField("Couleur d'affichage", max_length=30, null=True, blank=True)
    first_millesime = models.IntegerField(
        "Premier millésime disponible",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
        blank=True,
        null=True,
    )
    last_millesime = models.IntegerField(
        "Dernier millésime disponible",
        validators=[MinValueValidator(2000), MaxValueValidator(2050)],
        blank=True,
        null=True,
    )
    area = models.DecimalField("Surface", max_digits=15, decimal_places=4, blank=True, null=True)
    surface_artif = models.DecimalField(
        "Surface artificielle",
        max_digits=15,
        decimal_places=4,
        blank=True,
        null=True,
    )
    ocsge_available = models.BooleanField(
        "Statut de couverture OCSGE",
        default=False,
    )

    # DataColorationMixin properties that need to be set when heritating
    default_property = "insee"  # need to be set correctly to work
    default_color = "Yellow"
    land_type = AdminRef.COMMUNE
    default_analysis_level = AdminRef.COMMUNE

    @property
    def official_id(self) -> str:
        return self.insee

    @property
    def is_artif_ready(self):
        return self.departement.is_artif_ready

    def get_qs_cerema(self):
        return Cerema.objects.filter(city_insee=self.insee)

    def __str__(self):
        return f"{self.name} ({self.insee})"

    def get_ocsge_millesimes(self) -> set:
        return self.departement.ocsge_millesimes

    def get_cities(self):
        return [self]

    def get_official_id(self) -> str:
        return self.insee if self.insee is not None else ""

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        if needle.isdigit():
            qs = cls.objects.filter(insee__icontains=needle)
        else:
            qs = cls.objects.all()
            qs = qs.filter(name__unaccent__trigram_word_similar=needle)

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
