import collections
import logging
from decimal import Decimal
from typing import Dict, Literal

import pandas as pd
from django.conf import settings
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.db.models import Extent, Union
from django.contrib.gis.db.models.functions import Area, Centroid
from django.contrib.gis.geos import MultiPolygon, Polygon
from django.core.cache import cache
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Case, DecimalField, F, Q, QuerySet, Sum, Value, When
from django.db.models.functions import Cast, Coalesce, Concat
from django.urls import reverse
from django.utils.functional import cached_property
from simple_history.models import HistoricalRecords

from config.storages import PublicMediaStorage
from project.models.enums import ProjectChangeReason
from public_data.exceptions import LandException
from public_data.models import (
    AdminRef,
    ArtifZonage,
    CommuneDiff,
    CommuneSol,
    CouvertureSol,
    Departement,
    Epci,
    Land,
    OcsgeDiff,
    Region,
    Scot,
    UsageSol,
)
from public_data.models.administration import Commune
from public_data.models.administration.enums import ConsommationCorrectionStatus
from public_data.models.enums import SRID
from public_data.models.mixins import DataColorationMixin
from utils.db import cast_sum_area
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
    class OcsgeCoverageStatus(models.TextChoices):
        COMPLETE_UNIFORM = "COMPLETE_UNIFORM", "Complet et uniforme"
        """
        All cities of the project have OCS GE data for the selected millésimes,
        and the cities spreads over only one departement. This definition could
        evolve in the future if two departements have the same millésimes
        available, and the code allow for that verification.
        """

        COMPLETE_NOT_UNIFORM = "COMPLETE_NOT_UNIFORM", "Complet mais non uniforme"
        """
        All cities of the project have OCS GE data for the selected millésimes
        but the cities spreads over more than one departement.
        """

        PARTIAL = "PARTIAL", "Partiel"
        """
        At least one city of the project have OCS GE data for the selected
        millésimes.
        """

        NO_DATA = "NO_DATA", "Aucune donnée"
        """
        0 city of the project have OCS GE data for the selected millésimes.
        """

        UNDEFINED = "UNDEFINED", "Non défini"

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

    available_millesimes = models.CharField(
        "OCS GE disponibles",
        max_length=255,
        blank=True,
        null=True,
        help_text="Millésimes disponibles sur la période d'analyse du diagnostic.",
    )

    first_year_ocsge = models.IntegerField(
        "Premier millésime OCSGE",
        validators=[MinValueValidator(2000)],
        null=True,
        blank=True,
    )

    last_year_ocsge = models.IntegerField(
        "Dernier millésime OCSGE",
        validators=[MinValueValidator(2000)],
        null=True,
        blank=True,
    )

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

    theme_map_artif = models.ImageField(
        upload_to=upload_in_project_folder,
        blank=True,
        null=True,
        storage=PublicMediaStorage(),
    )

    theme_map_understand_artif = models.ImageField(
        upload_to=upload_in_project_folder,
        blank=True,
        null=True,
        storage=PublicMediaStorage(),
    )

    ocsge_coverage_status = models.CharField(
        "Statut de la couverture OCS GE",
        max_length=20,
        choices=OcsgeCoverageStatus.choices,
        default=OcsgeCoverageStatus.UNDEFINED,
    )

    async_add_city_done = models.BooleanField(default=False)
    async_set_combined_emprise_done = models.BooleanField(default=False)
    async_cover_image_done = models.BooleanField(default=False)
    async_find_first_and_last_ocsge_done = models.BooleanField(default=False)
    async_add_comparison_lands_done = models.BooleanField(default=False)
    async_generate_theme_map_conso_done = models.BooleanField(default=False)
    async_generate_theme_map_artif_done = models.BooleanField(default=False)
    async_theme_map_understand_artif_done = models.BooleanField(default=False)
    async_ocsge_coverage_status_done = models.BooleanField(default=False)

    history = HistoricalRecords(
        user_db_constraint=False,
    )

    @property
    def latest_change_is_ocsge_delivery(self) -> bool:
        latest_change = self.history.first()
        return latest_change.history_change_reason == ProjectChangeReason.NEW_OCSGE_HAS_BEEN_DELIVERED

    @property
    def async_complete(self) -> bool:
        calculations_and_extend_ready = (
            self.async_add_city_done
            and self.async_set_combined_emprise_done
            and self.async_cover_image_done
            and self.async_find_first_and_last_ocsge_done
            and self.async_ocsge_coverage_status_done
            and self.async_add_comparison_lands_done
        )

        static_maps_ready = self.async_cover_image_done

        not_a_commune = self.land_type != AdminRef.COMMUNE

        # logic below is duplicated from map_tasks in create.py
        # TODO : refactor this

        if not_a_commune:
            static_maps_ready = static_maps_ready and self.async_generate_theme_map_conso_done

        if not_a_commune and self.has_complete_uniform_ocsge_coverage:
            static_maps_ready = static_maps_ready and self.async_generate_theme_map_artif_done

        if self.has_complete_uniform_ocsge_coverage:
            static_maps_ready = static_maps_ready and self.async_theme_map_understand_artif_done

        return calculations_and_extend_ready and static_maps_ready

    @property
    def is_ready_to_be_displayed(self) -> bool:
        return (
            self.async_add_city_done
            and self.async_set_combined_emprise_done
            and self.async_add_comparison_lands_done
            and self.async_find_first_and_last_ocsge_done
            and self.async_ocsge_coverage_status_done
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
    def __related_departements(self):
        return self.cities.values_list("departement_id", flat=True).distinct().all()

    def get_ocsge_coverage_status(self) -> OcsgeCoverageStatus:
        related_cities_with_ocsge = self.cities.filter(
            ocsge_available=True,
            last_millesime__lte=self.analyse_end_date,
            first_millesime__gte=self.analyse_start_date,
        )

        related_cities_with_ocsge_count = related_cities_with_ocsge.count()
        all_related_cities_have_ocsge = related_cities_with_ocsge_count == self.cities.count()
        at_least_one_related_cities_have_ocsge = related_cities_with_ocsge_count > 1
        departement_count = self.__related_departements.count()

        if all_related_cities_have_ocsge and departement_count == 1:
            return self.OcsgeCoverageStatus.COMPLETE_UNIFORM

        if all_related_cities_have_ocsge and departement_count > 1:
            return self.OcsgeCoverageStatus.COMPLETE_NOT_UNIFORM

        if at_least_one_related_cities_have_ocsge:
            return self.OcsgeCoverageStatus.PARTIAL

        return self.OcsgeCoverageStatus.NO_DATA

    @cached_property
    def has_complete_uniform_ocsge_coverage(self) -> bool:
        return self.ocsge_coverage_status == self.OcsgeCoverageStatus.COMPLETE_UNIFORM

    @cached_property
    def has_complete_not_uniform_ocsge_coverage(self) -> bool:
        return self.ocsge_coverage_status == self.OcsgeCoverageStatus.COMPLETE_NOT_UNIFORM

    @cached_property
    def has_partial_ocsge_coverage(self) -> bool:
        return self.ocsge_coverage_status == self.OcsgeCoverageStatus.PARTIAL

    @cached_property
    def has_no_ocsge_coverage(self) -> bool:
        return self.ocsge_coverage_status == self.OcsgeCoverageStatus.NO_DATA

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

    def get_ocsge_millesimes(self):
        """Return all OCS GE millésimes available within project cities and between
        project analyse start and end date"""
        return self.land.get_ocsge_millesimes()

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

    def get_artif_area(self):
        """Return artificial surface total for all city inside diagnostic"""
        result = self.cities.all().aggregate(total=Sum("surface_artif"))
        return result["total"] or 0

    def get_artif_per_maille_and_period(self):
        """Return example: {"new_artif": 12, "new_natural": 2: "net_artif": 10}"""
        mapping = {
            AdminRef.COMPOSITE: "city__name",
            AdminRef.COMMUNE: "city__name",
            AdminRef.EPCI: "city__epci__name",
            AdminRef.SCOT: "city__scot__name",
            AdminRef.DEPARTEMENT: "city__departement__name",
            AdminRef.REGION: "city__departement__region__name",
        }
        qs = (
            CommuneDiff.objects.all()
            .filter(city__in=self.cities.all())
            .annotate(
                period=Concat("year_old", Value(" - "), "year_new", output_field=models.CharField()),
                name=Coalesce(F(mapping.get(self.level, "city__name")), Value("Non couvert")),
            )
            .order_by("name", "period", "year_old", "year_new")
            .values("name", "period", "year_old", "year_new")
            .annotate(
                area=Sum("city__area") / 10000,
                new_artif=Coalesce(Sum("new_artif"), Decimal("0")),
                new_natural=Coalesce(Sum("new_natural"), Decimal("0")),
                net_artif=Coalesce(Sum("net_artif"), Decimal("0")),
            )
        )
        if qs.exists():
            return qs
        else:
            # TODO: remove this when we have a better way to handle empty data
            # At the moment this is a workaround to avoid pages from crashing
            # bug this will leave most figures empty (maps, graphs etc.)
            return {
                "name": "Non couvert",
                "period": f"{self.analyse_start_date} - {self.analyse_end_date}",
                "new_artif": [0],
                "new_natural": [0],
                "net_artif": [0],
                "area": [0],
            }

    def get_artif_progession_time_scoped(self):
        """Return example: {"new_artif": 12, "new_natural": 2: "net_artif": 10}"""
        return (
            CommuneDiff.objects.all()
            .filter(
                city__in=self.cities.all(),
                year_old__gte=self.analyse_start_date,
                year_new__lte=self.analyse_end_date,
            )
            .aggregate(
                new_artif=Coalesce(Sum("new_artif"), Decimal("0")),
                new_natural=Coalesce(Sum("new_natural"), Decimal("0")),
                net_artif=Coalesce(Sum("net_artif"), Decimal("0")),
            )
        )

    def get_artif_evolution(self):
        """Return example:
        [
            {"period": "2013 - 2016", "new_artif": 12, "new_natural": 2: "net_artif": 10},
            {"period": "2016 - 2019", "new_artif": 15, "new_natural": 7: "net_artif": 8},
        ]
        """
        qs = CommuneDiff.objects.filter(city__in=self.cities.all())
        qs = qs.annotate(
            period=Concat(
                "year_old",
                Value(" - "),
                "year_new",
                output_field=models.CharField(),
            )
        )
        qs = qs.values("period", "year_old", "year_new")
        qs = qs.annotate(
            new_artif=Coalesce(Sum("new_artif"), Decimal("0")),
            new_natural=Coalesce(Sum("new_natural"), Decimal("0")),
            net_artif=Coalesce(Sum("net_artif"), Decimal("0")),
        )
        return qs

    def get_artif_periods(self) -> tuple[tuple[int]]:
        """
        Return example:
        ((2013, 2016), (2016, 2019))
        """
        departement: Departement = self.cities.first().departement

        if not departement.ocsge_millesimes:
            return ()

        periods = ()

        for i in range(len(departement.ocsge_millesimes) - 1):
            periods += ((departement.ocsge_millesimes[i], departement.ocsge_millesimes[i + 1]),)

        return periods

    def get_land_artif_per_year(self, analysis_level):
        """Return artif evolution for all cities of the diagnostic

        {
            "city_name": {
                "2013-2016": 10,
                "2016-2019": 15,
            }
        }
        """
        transco = {
            "DEPART": "city__departement__name",
            "EPCI": "city__epci__name",
            "REGION": "city__departement__region__name",
            "SCOT": "city__scot__name",
        }
        field_name = transco.get(analysis_level, "city__name")
        qs = (
            CommuneDiff.objects.filter(city__in=self.cities.all())
            .annotate(name=Coalesce(F(field_name), Value("Non couvert")))
            .filter(year_old__gte=self.analyse_start_date, year_new__lte=self.analyse_end_date)
            .annotate(
                period=Concat(
                    "year_old",
                    Value(" - "),
                    "year_new",
                    output_field=models.CharField(),
                )
            )
            .values("name", "period")
            .annotate(net_artif=Sum("net_artif"))
        )
        results = collections.defaultdict(dict)
        for row in qs:
            results[row["name"]][row["period"]] = row["net_artif"]
        return results

    def get_city_artif_per_year(self):
        """Return artif evolution for all cities of the diagnostic

        {
            "city_name": {
                "2013-2016": 10,
                "2016-2019": 15,
            }
        }
        """
        qs = CommuneDiff.objects.filter(city__in=self.cities.all()).filter(
            year_old__gte=self.analyse_start_date, year_new__lte=self.analyse_end_date
        )
        results = collections.defaultdict(dict)
        for commune in qs:
            results[commune.city.name][commune.period] = commune.net_artif
        return results

    def get_bounding_box(self):
        result = self.emprise_set.aggregate(bbox=Extent("mpoly"))
        return list(result["bbox"])

    def get_centroid(self):
        result = self.emprise_set.aggregate(center=Centroid(Union("mpoly")))
        return result["center"]

    def get_available_millesimes(self, commit=False):
        millesimes = set()

        departements = self.cities.values_list("departement", flat=True)
        for departement in Departement.objects.filter(source_id__in=departements):
            if departement.ocsge_millesimes:
                millesimes.update(departement.ocsge_millesimes)

        return [y for y in millesimes if int(self.analyse_start_date) <= y <= int(self.analyse_end_date)]

    def get_first_last_millesime(self):
        """return {"first": yyyy, "last": yyyy} which are the first and last
        OCS GE millesime completly included in diagnostic time frame"""
        millesimes = self.get_available_millesimes()
        if millesimes:
            return {"first": min(millesimes), "last": max(millesimes)}
        else:
            return {"first": None, "last": None}

    def get_base_sol(self, millesime, sol="couverture"):
        if sol == "couverture":
            code_field = F("matrix__couverture__code_prefix")
            klass = CouvertureSol
        else:
            code_field = F("matrix__usage__code_prefix")
            klass = UsageSol
        qs = CommuneSol.objects.filter(city__in=self.cities.all(), year=millesime)
        qs = qs.annotate(code_prefix=code_field)
        qs = qs.values("code_prefix")
        qs = qs.annotate(surface=Coalesce(Sum("surface"), Decimal(0)))
        data = list(qs)
        item_list = list(klass.objects.all().order_by("code"))
        for item in item_list:
            item.surface = sum([_["surface"] for _ in data if _["code_prefix"].startswith(item.code_prefix)])
        return item_list

    def get_base_sol_progression(self, first_millesime, last_millesime, sol="couverture"):
        if sol == "couverture":
            code_field = F("matrix__couverture__code_prefix")
            klass = CouvertureSol
        else:
            code_field = F("matrix__usage__code_prefix")
            klass = UsageSol

        qs = CommuneSol.objects.filter(city__in=self.cities.all(), year__in=[first_millesime, last_millesime])
        qs = qs.annotate(code_prefix=code_field)
        qs = qs.values("code_prefix")
        qs = qs.annotate(surface_first=cast_sum_area("surface", filter=Q(year=first_millesime), divider=1))
        qs = qs.annotate(surface_last=cast_sum_area("surface", filter=Q(year=last_millesime), divider=1))
        data = list(qs)
        item_list = list(klass.objects.all().order_by("code"))
        for item in item_list:
            item.surface_first = sum(
                [
                    _["surface_first"]
                    for _ in data
                    if _["code_prefix"] and _["code_prefix"].startswith(item.code_prefix)
                ]
            )
            item.surface_last = sum(
                [_["surface_last"] for _ in data if _["code_prefix"] and _["code_prefix"].startswith(item.code_prefix)]
            )
            item.surface_diff = item.surface_last - item.surface_first
        return item_list

    def get_detail_artif(self, sol: Literal["couverture", "usage"], geom: MultiPolygon | None = None):
        """
        [
            {
                "code_prefix": "CS1.1.1",
                "artif": 1000.0,
                "renat":  100.0,
            },
            {...}
        ]
        """
        if not geom:
            geom = self.combined_emprise
        Zero = Area(Polygon(((0, 0), (0, 0), (0, 0), (0, 0)), srid=2154))

        short_sol = "us" if sol == "usage" else "cs"

        return (
            OcsgeDiff.objects.intersect(geom)
            .filter(
                year_old__gte=self.analyse_start_date,
                year_new__lte=self.analyse_end_date,
            )
            .filter(Q(is_new_artif=True) | Q(is_new_natural=True))
            .annotate(
                code_prefix=Case(
                    When(is_new_artif=True, then=F(f"{short_sol}_new")),
                    default=F(f"{short_sol}_old"),
                ),
                area_artif=Case(When(is_new_artif=True, then=F("intersection_area")), default=Zero),
                area_renat=Case(When(is_new_natural=True, then=F("intersection_area")), default=Zero),
            )
            .order_by("code_prefix")
            .values("code_prefix")
            .annotate(
                artif=Cast(Sum("area_artif") / 10000, DecimalField(max_digits=15, decimal_places=2)),
                renat=Cast(Sum("area_renat") / 10000, DecimalField(max_digits=15, decimal_places=2)),
            )
        )

    def get_base_sol_artif(self, sol: Literal["couverture", "usage"] = "couverture"):
        """
        [
            {
                "code_prefix": "CS1.1.1",
                "label": "Zone Bâti (maison,...)",
                "label_short": "Zone Bâti",
                "map_color": "#FF0000",
                "surface": 1000.0,
            },
            {...}
        ]
        """
        return (
            CommuneSol.objects.filter(
                city__in=self.cities.all(),
                year=self.last_year_ocsge,
                matrix__is_artificial=True,
            )
            .annotate(
                code_prefix=F(f"matrix__{sol}__code_prefix"),
                label=F(f"matrix__{sol}__label"),
                label_short=F(f"matrix__{sol}__label_short"),
                map_color=F(f"matrix__{sol}__map_color"),
            )
            .order_by("code_prefix", "label", "label_short", "map_color")
            .values("code_prefix", "label", "label_short", "map_color")
            .annotate(surface=Sum("surface"))
        )

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

    def get_matrix(self, sol: Literal["couverture", "usage"] = "couverture"):
        """
        TODO: refactor
        """
        if sol == "usage":
            prefix = "us"
            headers = {_.code: _ for _ in UsageSol.objects.all()}
        else:
            prefix = "cs"
            headers = {_.code: _ for _ in CouvertureSol.objects.all()}
        index = f"{prefix}_old"
        column = f"{prefix}_new"
        qs = (
            OcsgeDiff.objects.intersect(self.combined_emprise)
            .filter(
                year_old__gte=self.analyse_start_date,
                year_new__lte=self.analyse_end_date,
            )
            .values(index, column)
            .annotate(total=Sum("intersection_area") / 10000)
            .order_by(index, column)
        )

        filtered_qs = [row for row in qs if row[index] != row[column]]

        if filtered_qs:
            df = (
                pd.DataFrame(filtered_qs)
                .fillna("")
                .pivot(
                    index=index,
                    columns=column,
                    values="total",
                )
                .fillna(0)
            )

            result = {}

            for i, row in df.iterrows():
                result[headers[i[2:]]] = {headers[c[2:]]: row[c] for c in df.columns}

            return result
        else:
            return dict()

    def get_artif_per_zone_urba_type(
        self,
    ) -> Dict[
        Literal["AUs", "AUc", "A", "N", "U"],
        Dict[
            Literal["type_zone", "total_area", "first_artif_area", "last_artif_area", "fill_up_rate", "new_artif"],
            str | float,
        ],
    ]:
        zone_labels = {
            "U": "zone urbaine",
            "AUc": "zone à urbaniser",
            "AUs": "zone à urbaniser bloquée",
            "A": "zone agricole",
            "N": "zone naturelle",
            "Nd": "zone naturelle particulière",
            "Nh": "zone bâtie en zone naturelle",
            "Ah": "zone bâtie en zone agricole",
        }

        first_year = ArtifZonage.objects.filter(
            land_id=self.land_id,
            land_type=self.land_type,
            year=self.first_year_ocsge,
        )

        last_year = ArtifZonage.objects.filter(
            land_id=self.land_id,
            land_type=self.land_type,
            year=self.last_year_ocsge,
        )

        new_zone_list = dict()
        for zonage in first_year:
            new_zone_list[zonage.zonage_type] = {
                "first_artif_area": zonage.artificial_surface / 10000,
            }

        for zonage in last_year:
            if zonage.zonage_type not in new_zone_list:
                new_zone_list[zonage.zonage_type] = {
                    "first_artif_area": 0.0,
                }
            new_zone_list[zonage.zonage_type] |= {
                "type_zone": zonage.zonage_type,
                "type_zone_label": zone_labels[zonage.zonage_type],
                "total_area": zonage.surface / 10000,
                "nb_zones": zonage.zonage_count,
                "last_artif_area": zonage.artificial_surface / 10000,
                "fill_up_rate": zonage.artificial_percent,
            }

        for zonage in last_year:
            new_zone_list[zonage.zonage_type]["new_artif"] = (
                new_zone_list[zonage.zonage_type]["last_artif_area"]
                - new_zone_list[zonage.zonage_type]["first_artif_area"]
            )

        return new_zone_list


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
