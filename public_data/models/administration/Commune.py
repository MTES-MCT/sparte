from django.contrib.gis.db import models
from django.contrib.postgres.search import TrigramSimilarity
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models.functions import Lower

from public_data.models.enums import SRID
from public_data.models.mixins import DataColorationMixin
from utils.db import IntersectManager

from .AdminRef import AdminRef
from .enums.ConsommationCorrectionStatus import ConsommationCorrectionStatus
from .GetDataFromCeremaMixin import GetDataFromCeremaMixin
from .LandMixin import LandMixin


class CommuneManager(IntersectManager):
    def get_by_natural_key(self, insee):
        return self.get(insee=insee)


class Commune(DataColorationMixin, LandMixin, GetDataFromCeremaMixin, models.Model):
    class Meta:
        managed = False

    insee = models.CharField("Code INSEE", max_length=7, primary_key=True)
    name = models.CharField("Nom", max_length=50)
    departement = models.ForeignKey("Departement", on_delete=models.PROTECT)
    epci = models.ForeignKey("Epci", on_delete=models.PROTECT)

    scot = models.ForeignKey(
        "Scot",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        to_field="source_id",
    )
    mpoly = models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    objects = CommuneManager()

    # Calculated fields
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
    area = models.DecimalField("Surface", max_digits=15, decimal_places=4)
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
    consommation_correction_status = models.CharField(
        "Statut de correction des données de consommation",
        max_length=20,
        choices=ConsommationCorrectionStatus.choices,
    )
    autorisation_logement_available = models.BooleanField(
        "Statut de disponibilité des données d'autorisation de logement",
        default=False,
    )
    logements_vacants_available = models.BooleanField(
        "Statut de disponibilité des données de logement vacant",
        default=False,
    )

    competence_planification = models.BooleanField("Compétence planification", default=False)

    # DataColorationMixin properties that need to be set when heritating
    default_property = "insee"  # need to be set correctly to work
    default_color = "Yellow"
    land_type = AdminRef.COMMUNE
    land_type_label = AdminRef.CHOICES_DICT[land_type]
    default_analysis_level = AdminRef.COMMUNE

    @property
    def official_id(self) -> str:
        return self.insee

    def get_by_natural_key(self, insee):
        return self.get(insee=insee)

    @property
    def is_artif_ready(self):
        return self.departement.is_artif_ready

    def __str__(self):
        return f"{self.name} ({self.insee})"

    def get_ocsge_millesimes(self) -> set:
        return self.departement.ocsge_millesimes

    def get_cities(self):
        return Commune.objects.filter(insee=self.insee).all()

    def get_official_id(self) -> str:
        return self.insee if self.insee is not None else ""

    @classmethod
    def search(cls, needle, region=None, departement=None, epci=None):
        if needle.isdigit():
            qs = cls.objects.annotate(similarity=TrigramSimilarity("insee", needle))
        else:
            qs = cls.objects.annotate(similarity=TrigramSimilarity(Lower("name__unaccent"), needle.lower()))

        qs = qs.filter(similarity__gt=0.2)  # Filtrer par un score minimum de similarité
        qs = qs.order_by("-similarity")  # Trier par score décroissant

        return qs

    @classmethod
    def get_property_data(cls, property_name=None):
        qs = cls.objects.all()
        qs = qs.values_list(property_name, flat=True)
        qs = qs.order_by(property_name)
        return [(int(x),) for x in qs if x.isdigit()]
