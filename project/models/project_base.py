import collections
import logging
import traceback
from decimal import Decimal
from typing import Dict, List, Literal

import pandas as pd
from django.conf import settings
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.db.models import Extent, Union
from django.contrib.gis.db.models.functions import Area, Centroid
from django.contrib.gis.geos import MultiPolygon, Polygon
from django.core.cache import cache
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Case, DecimalField, F, Q, Sum, Value, When
from django.db.models.functions import Cast, Coalesce, Concat
from django.urls import reverse
from django.utils import timezone
from django.utils.functional import cached_property
from simple_history.models import HistoricalRecords

from config.storages import PublicMediaStorage
from project.models.exceptions import TooOldException
from public_data.models import (
    AdminRef,
    Cerema,
    CommuneDiff,
    CommunePop,
    CommuneSol,
    CouvertureSol,
    Departement,
    Land,
    Ocsge,
    OcsgeDiff,
    UsageSol,
)
from public_data.models.administration import Commune
from public_data.models.mixins import DataColorationMixin
from utils.db import cast_sum

from .utils import user_directory_path

logger = logging.getLogger(__name__)


class ProjectNotSaved(BaseException):
    """Exception raised when project needs to be saved once before performing the
    requested action"""

    pass


def upload_in_project_folder(project: "Project", filename: str) -> str:
    """Define where to upload project's cover image : diagnostic/<int:id>
    nb: currently you can't add cover image if project is not saved yet"""

    return f"diagnostics/{project.get_folder_name()}/{filename}"


class BaseProject(models.Model):
    class EmpriseOrigin(models.TextChoices):
        UNSET = "UNSET", "Origine non renseignée"
        FROM_SHP = "FROM_SHP", "Construit depuis un fichier shape"
        FROM_CITIES = "FROM_CITIES", "Construit depuis une liste de villes"
        WITH_EMPRISE = "WITH_EMPRISE", "Emprise déjà fournie"

    class Status(models.TextChoices):
        MISSING = "MISSING", "Emprise à renseigner"
        PENDING = "PENDING", "Traitement du fichier Shape en cours"
        SUCCESS = "SUCCESS", "Emprise renseignée"
        FAILED = "FAILED", "Création de l'emprise échouée"

    emprise_origin = models.CharField(
        "Origine de l'emprise",
        max_length=20,
        choices=EmpriseOrigin.choices,
        default=EmpriseOrigin.UNSET,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="propriétaire",
        blank=True,
        null=True,
    )
    name = models.CharField("Nom", max_length=100)
    description = models.TextField("Description", blank=True)
    shape_file = models.FileField(
        "Fichier .shp",
        upload_to=user_directory_path,
        max_length=100,
        blank=True,
        null=True,
    )
    # fields to track the shape files importation into the database
    import_error = models.TextField(
        "Message d'erreur traitement emprise",
        null=True,
        blank=True,
    )
    import_date = models.DateTimeField("Date et heure d'import", null=True, blank=True)
    import_status = models.CharField(
        "Statut import",
        max_length=10,
        choices=Status.choices,
        default=Status.MISSING,
    )

    @cached_property
    def combined_emprise(self):
        """Return a combined MultiPolygon of all emprises."""
        combined = self.emprise_set.aggregate(Union("mpoly"))
        if "mpoly__union" in combined:
            return combined["mpoly__union"]
        else:
            return None

    @cached_property
    def area(self) -> float:
        try:
            return float(self.combined_emprise.transform(2154, clone=True).area / 10000)
        except AttributeError:
            return float(0)

    def __str__(self):
        return self.name

    def set_success(self, save=True):
        self.import_status = self.Status.SUCCESS
        self.import_date = timezone.now()
        self.import_error = None
        if save:
            self.save()

    def set_failed(self, save=True, trace=None):
        self.import_status = self.Status.FAILED
        self.import_date = timezone.now()
        if trace:
            self.import_error = trace
        else:
            self.import_error = traceback.format_exc()
        if save:
            self.save()

    class Meta:
        abstract = True


class ProjectCommune(models.Model):
    project = models.ForeignKey("project.Project", on_delete=models.CASCADE)
    commune = models.ForeignKey("public_data.Commune", on_delete=models.PROTECT)
    group_name = models.CharField("Nom du groupe", max_length=100, blank=True, null=True)


class CityGroup:
    def __init__(self, name: str):
        self.name = name
        self.cities: List[Commune] = list()

    def append(self, project_commune: ProjectCommune) -> None:
        self.cities.append(project_commune.commune)

    def __str__(self) -> str:
        return self.name


class Project(BaseProject):
    ANALYZE_YEARS = [(str(y), str(y)) for y in range(2009, 2022)]
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
        "Année de début de période d'analyse",
        choices=ANALYZE_YEARS,
        default="2015",
        max_length=4,
        help_text="Utile pour analyser votre territoire sur une période différente.",
    )
    analyse_end_date = models.CharField(
        "Année de fin de période d'analyse",
        choices=ANALYZE_YEARS,
        default="2018",
        max_length=4,
        help_text="Utile pour analyser votre territoire sur une période différente.",
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

    def recover_public_key(self):
        try:
            id_list = self.land_ids.split(",")
        except AttributeError:
            raise TooOldException("Project too old, no land id saved")
        if len(id_list) > 1:
            raise TooOldException("Too old project, it contains several territory.")
        return f"{self.land_type}_{self.land_ids}"

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
    land_ids = models.CharField(
        "Type de territoire",
        max_length=255,
        help_text=(
            "Contient les identifiants qui composent le territoire du diagnostic. "
            "Il faut croiser cette donnée avec 'land_type' pour être en mesure de "
            "de récupérer dans la base les instances correspondantes."
        ),
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
        help_text=(
            "We need a way to find Project related within Cerema's data. "
            "this is the purpose of this field which has a very specific rule of "
            "construction, it's like a slug: EPCI_[ID], DEPART_[ID] (département), "
            "REGION_[ID], COMMUNE_[ID]. "
            "field can contain several public key separate by ;"
        ),
        blank=True,
        null=True,
    )
    target_2031 = models.IntegerField(
        "Seuil de réduction à 2031 (en %)",
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=50,
        help_text=(
            "A date, l'objectif national est de réduire de 50% la consommation "
            "d'espaces d'ici à 2031. Ce seuil doit être personnalisé localement "
            "par les SRADDET. Vous pouvez changer le seuil pour tester différents "
            "scénarios."
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
        help_text=("C'est le nom qui est utilisé pour désigner votre territoire, notamment " "dans le rapport word."),
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

    theme_map_gpu = models.ImageField(
        upload_to=upload_in_project_folder,
        blank=True,
        null=True,
        storage=PublicMediaStorage(),
    )

    theme_map_fill_gpu = models.ImageField(
        upload_to=upload_in_project_folder,
        blank=True,
        null=True,
        storage=PublicMediaStorage(),
    )

    async_add_city_done = models.BooleanField(default=False)
    async_set_combined_emprise_done = models.BooleanField(default=False)
    async_cover_image_done = models.BooleanField(default=False)
    async_find_first_and_last_ocsge_done = models.BooleanField(default=False)
    async_add_neighboors_done = models.BooleanField(default=False)
    async_generate_theme_map_conso_done = models.BooleanField(default=False)
    async_generate_theme_map_artif_done = models.BooleanField(default=False)
    async_theme_map_understand_artif_done = models.BooleanField(default=False)
    async_theme_map_gpu_done = models.BooleanField(default=False)
    async_theme_map_fill_gpu_done = models.BooleanField(default=False)

    history = HistoricalRecords()

    @property
    def async_complete(self):
        return (
            self.async_add_city_done
            & self.async_set_combined_emprise_done
            & self.async_cover_image_done
            & self.async_find_first_and_last_ocsge_done
            & self.async_add_neighboors_done
            & self.async_generate_theme_map_conso_done
            & self.async_generate_theme_map_artif_done
            & self.async_theme_map_understand_artif_done
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

    _city_group_list = None

    @property
    def city_group_list(self):
        if self._city_group_list is None:
            self._city_group_list = list()
            qs = ProjectCommune.objects.filter(project=self)
            qs = qs.select_related("commune")
            qs = qs.order_by("group_name", "commune__name")
            for project_commune in qs:
                if len(self._city_group_list) == 0 or self._city_group_list[-1].name != project_commune.group_name:
                    self._city_group_list.append(CityGroup(project_commune.group_name))
                self._city_group_list[-1].append(project_commune)
        return self._city_group_list

    def delete(self):
        self.cover_image.delete(save=False)
        return super().delete()

    def save(self, *args, **kwargs):
        logger.info("Saving project %d: update_fields=%s", self.id, str(kwargs.get("update_fields", [])))
        super().save(*args, **kwargs)
        cache.delete_pattern(f'*project/{self.id}/*')

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
            self._change_reason = "set folder_name"
            self.save(update_fields=["folder_name"])
        return self.folder_name

    @cached_property
    def is_artif(self):
        """Check first if departement has OCSGE millesime (to speed up process),
        secondly check if project emprise contains OCS GE data. Usefull for vendée
        project"""
        if self.cities.exclude(departement__source_id=33).filter(departement__is_artif_ready=True).exists():
            # au moins 1 département autre que la gironde avec Arcachon est artif_ready
            return True
        elif self.cities.filter(departement__source_id=33).exists():
            # on a une ville du département de gironde, alors on vérifie si on est sur la couche de données d'arcachon
            geom = self.combined_emprise
            if geom:
                return Ocsge.objects.filter(mpoly__intersects=geom).exists()
        # dans tous les autres cas il n'y a pas d'OCS GE
        return False

    def get_ocsge_millesimes(self):
        """Return all OCS GE millésimes available within project cities and between
        project analyse ztart and end date"""
        ids = self.cities.filter(departement__is_artif_ready=True).value_list("departement_id", flat=True)
        years = set()
        for dept in Departement.objects.filter(id__in=ids):
            years.update(dept.get_ocsge_millesimes())
        return [x for x in years if x <= self.analyse_end_date and x >= self.analyse_start_date]

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
            public_keys = {_ for _ in self.look_a_like.split(";")}
        except AttributeError:
            public_keys = set()
        for public_key in public_keys:
            try:
                lands.append(Land(public_key))
            except Exception:
                to_remove.append(public_key)
        if to_remove:
            self.remove_look_a_like(to_remove, many=True)
            self.save(update_fields=["look_a_like"])
        return sorted(lands, key=lambda x: x.name)

    # calculated fields
    # Following field contains calculated dict :
    # {
    #     '2015': {  # millésime
    #         'couverture': {  # covering type
    #             'cs1.1.1': 123,  # code and area in km square
    #             'cs1.1.2': 23,
    #         },
    #         'usage': { ... },  # same as couverture
    #     },
    #     '2018': { ... },  # same as 2015
    # }
    couverture_usage = models.JSONField(blank=True, null=True)

    def get_cerema_cities(self, group_name=None):
        if not group_name:
            code_insee = self.cities.all().values_list("insee", flat=True)
        else:
            code_insee = self.projectcommune_set.filter(group_name=group_name)
            code_insee = code_insee.values_list("commune__insee", flat=True)
        qs = Cerema.objects.pre_annotated()
        qs = qs.filter(city_insee__in=code_insee)
        return qs

    def get_determinants(self, group_name=None):
        """Return determinant for project's periode
        {
            "house"
            {
                "2015": 10,
                "2016": 3,
                "2018": 1,
            },
            "activity": {...},
            "both": {...},
            "unknown": {...},
        }
        """
        determinants = {
            "hab": "Habitat",
            "act": "Activité",
            "mix": "Mixte",
            "rou": "Route",
            "fer": "Ferré",
            "inc": "Non renseigné",
        }
        results = {f: dict() for f in determinants.values()}
        args = []
        for year in self.years:
            start = year[-2:]
            end = str(int(year) + 1)[-2:]
            for det in determinants.keys():
                args.append(Sum(f"art{start}{det}{end}"))
        qs = self.get_cerema_cities(group_name=group_name).aggregate(*args)
        for key, val in qs.items():
            if val is not None:
                year = f"20{key[3:5]}"
                det = determinants[key[5:8]]
                results[det][year] = val / 10000
        return results

    def get_bilan_conso(self):
        """Return the space consummed between 2011 and 2020 in hectare"""
        qs = self.get_cerema_cities().aggregate(bilan=Coalesce(Sum("naf11art21"), float(0)))
        return qs["bilan"] / 10000

    def get_bilan_conso_per_year(self):
        """Return the space consummed per year between 2011 and 2020"""
        qs = self.get_cerema_cities().aggregate(
            **{f"20{f[3:5]}": Sum(f) / 10000 for f in Cerema.get_art_field("2011", "2021")}
        )
        return qs

    def get_bilan_conso_time_scoped(self):
        """Return land consummed during the project time scope (between
        analyze_start_data and analyze_end_date)
        Evaluation is based on city consumption, not geo work."""
        qs = self.get_cerema_cities()
        # if not qs.exists():
        #     return 0
        fields = Cerema.get_art_field(self.analyse_start_date, self.analyse_end_date)
        sum_function = sum([F(f) for f in fields])
        qs = qs.annotate(line_sum=sum_function)
        aggregation = qs.aggregate(bilan=Coalesce(Sum("line_sum"), float(0)))
        try:
            return aggregation["bilan"] / 10000
        except TypeError:
            return 0

    _conso_per_year = None

    def get_conso_per_year(self):
        """Return Cerema data for the project, transposed and named after year"""
        if not self._conso_per_year:
            qs = self.get_cerema_cities()
            fields = Cerema.get_art_field(self.analyse_start_date, self.analyse_end_date)
            args = (Sum(field) for field in fields)
            qs = qs.aggregate(*args)
            self._conso_per_year = {
                f"20{key[3:5]}": val / 10000
                for key, val in qs.items()
                # if val is not None
            }
        return self._conso_per_year

    def get_pop_change_per_year(self, criteria: Literal["pop", "household"] = "pop") -> Dict:
        cities = (
            CommunePop.objects.filter(city__in=self.cities.all())
            .filter(year__gte=self.analyse_start_date)
            .filter(year__lte=self.analyse_end_date)
            .values("year")
            .annotate(pop_progression=Sum("pop_change"))
            .annotate(household_progression=Sum("household_change"))
            .order_by("year")
        )
        if criteria == "pop":
            data = {str(city["year"]): city["pop_progression"] for city in cities}
        else:
            data = {str(city["year"]): city["household_progression"] for city in cities}
        return {year: data.get(year, None) for year in self.years}

    def get_land_conso_per_year(self, level, group_name=None):
        """Return conso data aggregated by a specific level
        {
            "dept_name": {
                "2015": 10,
                "2016": 12,
                "2017": 9,
            },
        }

        Available level: any Cerema's field
        * city_name
        * epci_name
        * dept_name
        * region_name
        * scot [experimental]
        """
        fields = Cerema.get_art_field(self.analyse_start_date, self.analyse_end_date)
        qs = self.get_cerema_cities(group_name=group_name)
        qs = qs.values(level)
        qs = qs.annotate(**{f"20{field[3:5]}": Sum(field) / 10000 for field in fields})
        return {row[level]: {year: row[year] for year in self.years} for row in qs}

    def get_city_conso_per_year(self, group_name=None):
        """Return year artificialisation of each city in the project, on project
        time scope

        {
            "city_name": {
                "2015": 10,
                "2016": 12,
                "2017": 9,
            },
        }
        """
        return self.get_land_conso_per_year("city_name", group_name=group_name)

    def get_look_a_like_conso_per_year(self):
        """Return same data as get_conso_per_year but for land listed in
        look_a_like property"""
        return {
            land.name: land.get_conso_per_year(
                self.analyse_start_date,
                self.analyse_end_date,
            )
            for land in self.get_look_a_like()
        }

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
        return reverse("project:detail", kwargs={"pk": self.pk})

    def reset(self, save=False):
        """Remove everything from project dependencies
        ..TODO:: overload delete to remove files"""
        self.emprise_set.all().delete()
        self.import_status = BaseProject.Status.MISSING
        self.import_date = None
        self.import_error = None
        self.couverture_usage = None
        self.shape_file.delete(save=save)
        if save:
            self.save()

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
        return qs

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
        # result = self.emprise_set.aggregate(bbox=Extent('mpoly'))
        result = self.emprise_set.aggregate(center=Centroid(Union("mpoly")))
        return result["center"]

    def get_available_millesimes(self, commit=False):
        if not self.available_millesimes:
            self.available_millesimes = ",".join(
                str(y)
                for y in (
                    Ocsge.objects.intersect(self.combined_emprise)
                    .filter(year__gte=self.analyse_start_date, year__lte=self.analyse_end_date)
                    .order_by("year")
                    .distinct()
                    .values_list("year", flat=True)
                )
            )
            if commit:
                self.save(update_fields=["available_millesimes"])
        return [int(y) for y in self.available_millesimes.split(",") if y]

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
        qs = qs.annotate(surface_first=cast_sum("surface", filter=Q(year=first_millesime), divider=1))
        qs = qs.annotate(surface_last=cast_sum("surface", filter=Q(year=last_millesime), divider=1))
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
                "label": "Zone Bâti (maison,...)",
                "label_short": "Zone Bâti",
                "artif": 1000.0,
                "renat":  100.0,
            },
            {...}
        ]
        """
        if not geom:
            geom = self.combined_emprise
        Zero = Area(Polygon(((0, 0), (0, 0), (0, 0), (0, 0)), srid=2154))
        return (
            OcsgeDiff.objects.intersect(geom)
            .filter(
                year_old__gte=self.analyse_start_date,
                year_new__lte=self.analyse_end_date,
            )
            .filter(Q(is_new_artif=True) | Q(is_new_natural=True))
            .annotate(
                code_prefix=Case(
                    When(is_new_artif=True, then=F(f"new_matrix__{sol}__code_prefix")),
                    default=F(f"old_matrix__{sol}__code_prefix"),
                ),
                label=Case(
                    When(is_new_artif=True, then=F(f"new_matrix__{sol}__label")),
                    default=F(f"old_matrix__{sol}__label"),
                ),
                label_short=Case(
                    When(is_new_artif=True, then=F(f"new_matrix__{sol}__label_short")),
                    default=F(f"old_matrix__{sol}__label_short"),
                ),
                area_artif=Case(When(is_new_artif=True, then=F("intersection_area")), default=Zero),
                area_renat=Case(When(is_new_natural=True, then=F("intersection_area")), default=Zero),
            )
            .order_by("code_prefix", "label", "label_short")
            .values("code_prefix", "label", "label_short")
            .annotate(
                artif=Cast(Sum("area_artif") / 10000, DecimalField(max_digits=15, decimal_places=2)),
                renat=Cast(Sum("area_renat") / 10000, DecimalField(max_digits=15, decimal_places=2)),
            )
        )

    def get_base_sol_artif(self, sol="couverture"):
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

    def get_neighbors(self, land_type=None):
        if not land_type:
            land_type = self.land_type
        klass = AdminRef.get_class(land_type)
        return klass.objects.all().filter(mpoly__touches=self.combined_emprise).order_by("name")

    def get_matrix(self, sol="couverture"):
        if sol == "usage":
            prefix = "us"
            headers = {_.code: _ for _ in UsageSol.objects.all()}
        else:
            prefix = "cs"
            headers = {_.code: _ for _ in CouvertureSol.objects.all()}
        headers.update({"": CouvertureSol(id=0, code="N/A", label="Inconnu", label_short="Inconnu")})
        index = f"{prefix}_old"
        column = f"{prefix}_new"
        qs = (
            OcsgeDiff.objects.intersect(self.combined_emprise)
            .filter(
                year_old__gte=self.analyse_start_date,
                year_new__lte=self.analyse_end_date,
            )
            .values(index, column)
            .annotate(total=Sum("surface") / 10000)
            .order_by(index, column)
        )
        if qs.exists():
            df = pd.DataFrame(qs).fillna("").pivot(index=index, columns=column, values="total").fillna(0)

            return {
                headers[i[2:]]: {headers[c[2:]]: row[c] for c in df.columns}
                for i, row in df.iterrows()
                if not isinstance(i, float)
            }
        else:
            return dict()


class Emprise(DataColorationMixin, gis_models.Model):
    # DataColorationMixin properties that need to be set when heritating
    default_property = "id"
    default_color = "blue"

    project = gis_models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        verbose_name="Projet",
    )
    mpoly = gis_models.MultiPolygonField()

    # mapping for LayerMapping (from GeoDjango)
    mapping = {
        "mpoly": "MULTIPOLYGON",
    }

    class Meta:
        ordering = ["project"]

    def set_parent(self, project: Project):
        """Identical to Project"""
        self.project = project
