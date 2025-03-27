import logging
from typing import Literal

from django.conf import settings
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.db.models import Extent, Union
from django.contrib.gis.db.models.functions import Centroid
from django.contrib.gis.geos import MultiPolygon
from django.core.cache import cache
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import QuerySet
from django.urls import reverse
from django.utils.functional import cached_property
from simple_history.models import HistoricalRecords

from config.storages import PublicMediaStorage
from project.models.enums import ProjectChangeReason
from public_data.exceptions import LandException
from public_data.models import (
    AdminRef,
    ArtifZonage,
    Departement,
    Epci,
    Land,
    Region,
    Scot,
)
from public_data.models.administration import Commune
from public_data.models.administration.enums import ConsommationCorrectionStatus
from public_data.models.enums import SRID
from public_data.models.mixins import DataColorationMixin
from utils.validators import is_alpha_validator

logger = logging.getLogger(__name__)


class ProjectNotSaved(BaseException):
    """Exception raised when project needs to be saved once before performing the
    requested action"""


def upload_in_project_folder(project: "Project", filename: str) -> str:
    """Define where to upload project's cover image : diagnostic/<int:id>
    nb: currently you can't add cover image if project is not saved yet"""

    return f"diagnostics/{project.get_folder_name()}/{filename}"


class BaseProject(models.Model):
    class Status(models.TextChoices):
        MISSING = "MISSING", "Emprise à renseigner"
        PENDING = "PENDING", "Traitement du fichier Shape en cours"
        SUCCESS = "SUCCESS", "Emprise renseignée"
        FAILED = "FAILED", "Création de l'emprise échouée"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="propriétaire",
        blank=True,
        null=True,
    )
    name = models.CharField("Nom", max_length=100, validators=[is_alpha_validator])

    @cached_property
    def combined_emprise(self) -> MultiPolygon:
        return self.land.mpoly

    def __str__(self):
        return self.name

    class Meta:
        abstract = True


class ProjectCommune(models.Model):
    project = models.ForeignKey("project.Project", on_delete=models.CASCADE)
    commune = models.ForeignKey("public_data.Commune", on_delete=models.PROTECT, to_field="insee")
    group_name = models.CharField("Nom du groupe", max_length=100, blank=True, null=True)


class Project(BaseProject):
    ANALYZE_YEARS = [(str(y), str(y)) for y in range(2009, 2023)]
    LEVEL_CHOICES = AdminRef.CHOICES

    is_public = models.BooleanField(
        "Est publiquement accessible",
        default=False,
        help_text=(
            "Si non coché, le diagnostic n'est accessible que par vous. Si coché "
            "tous ceux qui ont l'URL peuvent y accéder. Utile pour partager le "
            "diagnostic par e-mail à vos collègues par exemple."
        ),
    )

    analyse_start_date = models.CharField(
        "Année de début de période du diagnostic",
        choices=ANALYZE_YEARS,
        default="2015",
        max_length=4,
    )
    analyse_end_date = models.CharField(
        "Année de fin de période du diagnostic",
        choices=ANALYZE_YEARS,
        default="2018",
        max_length=4,
    )
    level = models.CharField(
        "Niveau d'analyse",
        choices=LEVEL_CHOICES,
        default="COMMUNE",
        max_length=7,
        help_text=(
            "Utilisé dans les rapports afin de déterminer le niveau "
            "d'aggrégation des données à afficher. Si "
            "EPCI est sélectionné, alors les rapports montre des données EPCI par EPCI."
        ),
    )

    @property
    def level_label(self):
        return AdminRef.get_label(self.level)

    public_keys = models.CharField("Clé publiques", max_length=255, blank=True, null=True)

    def get_public_key(self) -> str:
        return f"{self.land_type}_{self.land_id}"

    land_type = models.CharField(
        "Type de territoire",
        choices=LEVEL_CHOICES,
        default="EPCI",
        max_length=7,
        help_text=(
            "Indique le niveau administratif des territoires sélectionnés par "
            "l'utilisateur lors de la création du diagnostic. Cela va de la commune à "
            "la région."
        ),
        blank=True,
        null=True,
    )
    land_id = models.CharField(
        "Identifiants du territoire du diagnostic",
        max_length=255,
        blank=True,
        null=True,
    )
    cities = models.ManyToManyField(
        "public_data.Commune",
        verbose_name="Communes",
        through=ProjectCommune,
        blank=True,
    )
    look_a_like = models.CharField(
        "Territoire pour se comparer",
        max_length=250,
        blank=True,
        null=True,
    )
    target_2031 = models.DecimalField(
        "Objectif de réduction à 2031 (en %)",
        max_digits=4,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=50,
        help_text=(
            "L'objectif fixé au niveau national par la loi Climat et résilience est de "
            "réduire de 50% la consommation d'espaces sur 2021-2031 par rapport à la "
            "décennie précédente.<br /><br />"
            "Cet objectif doit être territorialisé et peut être "
            "modulé via les documents de planification régionale ainsi que les documents "
            "d'urbanisme (SCOT, PLU(i), cartes communales).<br /><br /> "
            "Aussi, l'objectif de réduction fixé à défaut à -50% est indicatif et ne "
            "correspond pas nécessairement à l'objectif qui sera fixé pour le territoire "
            "sélectionné."
        ),
    )

    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    folder_name = models.CharField("Dossier", max_length=15, blank=True, null=True)

    territory_name = models.CharField(
        "Territoire",
        max_length=250,
        blank=True,
        null=True,
        help_text="C'est le nom qui est utilisé pour désigner votre territoire, notamment dans le rapport word.",
        validators=[is_alpha_validator],
    )

    cover_image = models.ImageField(
        upload_to=upload_in_project_folder,
        blank=True,
        null=True,
        storage=PublicMediaStorage(),
    )

    theme_map_conso = models.ImageField(
        upload_to=upload_in_project_folder,
        blank=True,
        null=True,
        storage=PublicMediaStorage(),
    )

    async_add_city_done = models.BooleanField(default=False)
    async_set_combined_emprise_done = models.BooleanField(default=False)
    async_cover_image_done = models.BooleanField(default=False)
    async_add_comparison_lands_done = models.BooleanField(default=False)
    async_generate_theme_map_conso_done = models.BooleanField(default=False)

    history = HistoricalRecords(
        user_db_constraint=False,
    )

    @property
    def async_complete(self) -> bool:
        calculations_and_extend_ready = (
            self.async_add_city_done
            and self.async_set_combined_emprise_done
            and self.async_cover_image_done
            and self.async_add_comparison_lands_done
        )

        static_maps_ready = self.async_cover_image_done

        not_a_commune = self.land_type != AdminRef.COMMUNE

        # logic below is duplicated from map_tasks in create.py
        # TODO : refactor this

        if not_a_commune:
            static_maps_ready = static_maps_ready and self.async_generate_theme_map_conso_done

        return calculations_and_extend_ready and static_maps_ready

    @property
    def is_ready_to_be_displayed(self) -> bool:
        return (
            self.async_add_city_done and self.async_set_combined_emprise_done and self.async_add_comparison_lands_done
        )

    class Meta:
        ordering = ["-created_date"]
        verbose_name = "Diagnostic en ligne"
        verbose_name_plural = "Diagnostics en lignes"

    @property
    def nb_years(self):
        return len(self.years)

    @property
    def years(self):
        return [
            str(y)
            for y in range(
                int(self.analyse_start_date),
                int(self.analyse_end_date) + 1,
            )
        ]

    @property
    def nb_years_before_2031(self):
        return 2031 - int(self.analyse_end_date)

    def delete(self):
        self.cover_image.delete(save=False)
        return super().delete()

    def save(self, *args, **kwargs):
        logger.info("Saving project %d: update_fields=%s", self.id, str(kwargs.get("update_fields", [])))
        super().save(*args, **kwargs)
        cache.delete_pattern(f"*project/{self.id}/*")

    def get_territory_name(self):
        if self.territory_name:
            return self.territory_name
        else:
            return self.name

    def get_folder_name(self):
        if not self.id:
            raise ProjectNotSaved(
                "Impossible de récupérer le dossier de stockage des fichiers avant "
                "d'avoir sauvegardé au moins une fois le diagnostic."
            )
        if not self.folder_name:
            self.folder_name = f"diag_{self.id:>06}"
            self._change_reason = ProjectChangeReason.FOLDER_CHANGED
            self.save(update_fields=["folder_name"])
        return self.folder_name

    @property
    def area(self) -> float:
        return self.land.area

    @cached_property
    def has_zonage_urbanisme(self) -> bool:
        return ArtifZonage.objects.filter(
            land_id=self.land_id,
            land_type=self.land_type,
        ).exists()

    @cached_property
    def consommation_correction_status(self) -> str:
        return self.land.consommation_correction_status

    @cached_property
    def autorisation_logement_available(self) -> str:
        return self.land.autorisation_logement_available

    @cached_property
    def logements_vacants_available(self) -> str:
        return self.land.logements_vacants_available

    @cached_property
    def has_unchanged_or_fusionned_consommation_data(self) -> bool:
        return self.consommation_correction_status in [
            ConsommationCorrectionStatus.UNCHANGED,
            ConsommationCorrectionStatus.FUSION,
        ]

    def add_look_a_like(self, public_key, many=False):
        """Add a public_key to look a like keeping the field formated
        and avoiding duplicate. Can process a list if many=True."""
        try:
            keys = {_ for _ in self.look_a_like.split(";")}
        except AttributeError:
            keys = set()
        if many:
            for item in public_key:
                keys.add(item)
        else:
            keys.add(public_key)
        self.look_a_like = ";".join(list(keys))

    def remove_look_a_like(self, public_key, many=False):
        """Remove a public_key from look_a_like property keeping it formated"""
        try:
            keys = {_ for _ in self.look_a_like.split(";")}
            if many:
                for key in public_key:
                    keys.remove(key)
            else:
                keys.remove(public_key)
            self.look_a_like = ";".join(list(keys))
        except (AttributeError, KeyError):
            return

    @property
    def nb_look_a_like(self):
        try:
            return len({_ for _ in self.look_a_like.split(";") if _ != ""})
        except AttributeError:
            return 0

    def get_look_a_like(self):
        """If a public_key is corrupted it removes it and hide the error"""
        lands = list()
        to_remove = list()
        try:
            # TODO: use ArrayField in models
            public_keys = {_ for _ in self.look_a_like.split(";") if _}
        except AttributeError:
            public_keys = set()
        for public_key in public_keys:
            try:
                lands.append(Land(public_key))
            except LandException:
                to_remove.append(public_key)
        if to_remove:
            self.remove_look_a_like(to_remove, many=True)
            self.save(update_fields=["look_a_like"])
        return sorted(lands, key=lambda x: x.name)

    def get_bilan_conso(self):
        """Return the space consummed between 2011 and 2020 in hectare"""
        from public_data.domain.containers import PublicDataContainer

        conso = PublicDataContainer.consommation_stats_service().get_by_land(
            land=self.land_proxy, start_date=2011, end_date=2020
        )
        return conso.total

    def get_bilan_conso_per_year(self):
        from public_data.domain.containers import PublicDataContainer

        conso = PublicDataContainer.consommation_progression_service().get_by_land(
            land=self.land_proxy, start_date=2011, end_date=2020
        )
        return {f"{c.year}": c.total for c in conso.consommation}

    def get_bilan_conso_time_scoped(self):
        """Return the space consummed between 2011 and 2020 in hectare"""
        from public_data.domain.containers import PublicDataContainer

        conso = PublicDataContainer.consommation_stats_service().get_by_land(
            land=self.land_proxy, start_date=self.analyse_start_date, end_date=self.analyse_end_date
        )
        return conso.total

    _conso_per_year = None

    def get_conso_per_year(self, coef=1):
        from public_data.domain.containers import PublicDataContainer
        from public_data.models import Land

        conso = PublicDataContainer.consommation_progression_service().get_by_land(
            land=Land(public_key=f"{self.land_type}_{self.land_id}"),
            start_date=int(self.analyse_start_date),
            end_date=int(self.analyse_end_date),
        )

        return {f"{c.year}": float(c.total) for c in conso.consommation}

    def get_land_conso_per_year(self, level, group_name=None):
        return {f"{self.territory_name}": self.get_conso_per_year()}

    def get_city_conso_per_year(self, group_name=None):
        return self.get_land_conso_per_year("city_name", group_name=group_name)

    def get_look_a_like_pop_change_per_year(
        self,
        criteria: Literal["pop", "household"] = "pop",
    ):
        """Return same data as get_pop_per_year but for land listed in
        look_a_like property"""
        return {
            land.name: land.get_pop_change_per_year(
                self.analyse_start_date,
                self.analyse_end_date,
                criteria=criteria,
            )
            for land in self.get_look_a_like()
        }

    def get_absolute_url(self):
        return reverse("project:home", kwargs={"pk": self.pk})

    def get_bounding_box(self):
        result = self.emprise_set.aggregate(bbox=Extent("mpoly"))
        return list(result["bbox"])

    def get_centroid(self):
        result = self.emprise_set.aggregate(center=Centroid(Union("mpoly")))
        return result["center"]

    @cached_property
    def land(self) -> Commune | Departement | Epci | Region | Scot:
        return Land(self.get_public_key()).land

    @property
    def land_proxy(self) -> Land:
        return Land(self.get_public_key())

    def get_arbitrary_comparison_lands(self) -> QuerySet[Departement] | QuerySet[Region] | None:
        """
        Return a queryset of lands if the project has arbitrary comparison lands
        set, otherwise None.

        Note that Guyane Française does not have arbitrary comparison lands the
        same way as the other DROM-COM. It is because the territory is too
        large to be compared with these territories.
        """
        arbitrary_comparison_source_ids = {
            AdminRef.DEPARTEMENT: {
                "971": ["972", "974"],
                "972": ["971", "974"],
                "974": ["971", "972"],
            },
            AdminRef.REGION: {
                "01": ["02", "04"],
                "02": ["01", "04"],
                "04": ["01", "02"],
            },
        }

        if self.land_type not in arbitrary_comparison_source_ids:
            return None

        if self.land.official_id not in arbitrary_comparison_source_ids[self.land_type]:
            return None

        comparison_source_ids = arbitrary_comparison_source_ids[self.land_type][self.land.official_id]

        return AdminRef.get_class(name=self.land_type).objects.filter(source_id__in=comparison_source_ids)

    def get_neighbors(self):
        return (
            AdminRef.get_class(self.land_type)
            .objects.filter(mpoly__intersects=self.combined_emprise.buffer(0.0001))
            .exclude(mpoly=self.land.mpoly)
        )

    def get_comparison_lands(
        self, limit=9
    ) -> QuerySet[Commune] | QuerySet[Departement] | QuerySet[Region] | QuerySet[Epci] | QuerySet[Scot]:
        """
        Returns a queryset of lands that the project is to be compared with.

        By defaut, returns lands neighboring the project's combined emprise,
        unless arbitrary comparison lands are defined.
        """
        return (self.get_arbitrary_comparison_lands() or self.get_neighbors()).order_by("name")[:limit]

    def comparison_lands_and_self_land(self) -> list[Land]:
        look_a_likes = self.get_look_a_like()
        return [self.land_proxy] + look_a_likes


class Emprise(DataColorationMixin, gis_models.Model):
    # DataColorationMixin properties that need to be set when heritating
    default_property = "id"
    default_color = "blue"

    project = gis_models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        verbose_name="Projet",
    )
    mpoly = gis_models.MultiPolygonField(srid=4326)
    srid_source = models.IntegerField(
        "SRID",
        choices=SRID.choices,
        default=SRID.LAMBERT_93,
    )

    # mapping for LayerMapping (from GeoDjango)
    mapping = {
        "mpoly": "MULTIPOLYGON",
    }

    class Meta:
        ordering = ["project"]

    def set_parent(self, project: Project):
        """Identical to Project"""
        self.project = project
