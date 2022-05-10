import traceback

from django.conf import settings
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.db.models import Union
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Sum, F, Value
from django.db.models.functions import Concat
from django.urls import reverse
from django.utils import timezone
from django.utils.functional import cached_property

from public_data.models.mixins import DataColorationMixin
from public_data.models import Cerema, Land, CommuneDiff

from .utils import user_directory_path


class BaseProject(models.Model):
    class EmpriseOrigin(models.TextChoices):
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
        default=EmpriseOrigin.FROM_SHP,
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
    def area(self):
        return self.combined_emprise.transform(2154, clone=True).area / (100 ** 2)

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
        ordering = ["name"]
        abstract = True


class ProjectCommune(models.Model):
    project = models.ForeignKey("project.Project", on_delete=models.CASCADE)
    commune = models.ForeignKey("public_data.Commune", on_delete=models.PROTECT)
    group_name = models.CharField(
        "Nom du groupe", max_length=100, blank=True, null=True
    )


class CityGroup:
    def __init__(self, name: str):
        self.name = name
        self.cities = list()

    def append(self, project_commune: ProjectCommune):
        self.cities.append(project_commune.commune)

    def __str__(self) -> str:
        return self.name


class Project(BaseProject):

    ANALYZE_YEARS = [(str(y), str(y)) for y in range(2009, 2020)]

    is_public = models.BooleanField("Public", default=False)

    analyse_start_date = models.CharField(
        "Date de début de période d'analyse",
        choices=ANALYZE_YEARS,
        default="2015",
        max_length=4,
    )
    analyse_end_date = models.CharField(
        "Date de fin de période d'analyse",
        choices=ANALYZE_YEARS,
        default="2018",
        max_length=4,
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
        null=True,
    )

    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    first_year_ocsge = models.IntegerField(
        "Premier millésime OCSGE", validators=[MinValueValidator(2000)], null=True
    )
    last_year_ocsge = models.IntegerField(
        "Dernier millésime OCSGE", validators=[MinValueValidator(2000)], null=True
    )

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
                if (
                    len(self._city_group_list) == 0
                    or self._city_group_list[-1].name != project_commune.group_name
                ):
                    self._city_group_list.append(CityGroup(project_commune.group_name))
                self._city_group_list[-1].append(project_commune)
        return self._city_group_list

    def add_look_a_like(self, public_key):
        """Add a public_key to look a like keeping the field formated
        and avoiding duplicate"""
        if self.look_a_like:
            keys = self.look_a_like.split(";")
            if public_key not in keys:
                keys.append(public_key)
                self.look_a_like = ";".join(keys)
        else:
            self.look_a_like = public_key

    def remove_look_a_like(self, public_key):
        """Remove a public_key from look_a_like property keeping it formated"""
        if self.look_a_like:
            keys = self.look_a_like.split(";")
            if public_key in keys:
                keys.pop(keys.index(public_key))
                self.look_a_like = ";".join(keys)

    def get_look_a_like(self):
        """If a public_key is corrupted it removes it and hide the error"""
        lands = list()
        to_remove = list()
        public_keys = self.look_a_like.split(";")
        for public_key in public_keys:
            try:
                lands.append(Land(public_key))
            except Exception:
                to_remove.append(public_key)
        if to_remove:
            for public_key in to_remove:
                self.remove_look_a_like(public_key)
            self.save()
        return lands

    def get_lands(self):
        if self.look_a_like:
            return [Land(public_key) for public_key in self.look_a_like.split(";")]
        return list()

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
        qs = Cerema.objects.filter(city_insee__in=code_insee)
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
        qs = self.get_cerema_cities()
        # if not qs.exists():
        #     return 0
        aggregation = qs.aggregate(bilan=Sum("naf11art21"))
        return aggregation["bilan"] / 10000

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
        aggregation = qs.aggregate(bilan=Sum("line_sum"))
        return aggregation["bilan"] / 10000

    _conso_per_year = None

    def get_conso_per_year(self):
        """Return Cerema data for the project, transposed and named after year"""
        if not self._conso_per_year:
            qs = self.get_cerema_cities()
            fields = Cerema.get_art_field(
                self.analyse_start_date, self.analyse_end_date
            )
            args = (Sum(field) for field in fields)
            qs = qs.aggregate(*args)
            self._conso_per_year = {
                f"20{key[3:5]}": val / 10000
                for key, val in qs.items()
                if val is not None
            }
        return self._conso_per_year

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
        results = dict()
        qs = self.get_cerema_cities(group_name=group_name)
        fields = Cerema.get_art_field(self.analyse_start_date, self.analyse_end_date)
        for city in qs:
            results[city.city_name] = dict()
            total = 0
            for field in fields:
                val = getattr(city, field) / 10000
                total += val
                results[city.city_name][f"20{field[3:5]}"] = val
        return results

    def get_look_a_like_conso_per_year(self):
        """Return same data as get_conso_per_year but for land listed in
        look_a_like property"""
        datas = dict()
        if not self.look_a_like:
            return datas
        for public_key in self.look_a_like.split(";"):
            land = Land(public_key)
            datas[land.name] = land.get_conso_per_year(
                self.analyse_start_date,
                self.analyse_end_date,
            )
        return datas

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
        return result["total"]

    def get_artif_progession_time_scoped(self):
        """Return example: {"new_artif": 12, "new_natural": 2: "net_artif": 10}"""
        qs = CommuneDiff.objects.filter(city__in=self.cities.all())
        qs = qs.filter(
            year_old__gte=self.analyse_start_date, year_new__lte=self.analyse_end_date
        )
        return qs.aggregate(
            new_artif=Sum("new_artif"),
            new_natural=Sum("new_natural"),
            net_artif=Sum("net_artif"),
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
        qs = qs.values("period")
        qs = qs.annotate(
            new_artif=Sum("new_artif"),
            new_natural=Sum("new_natural"),
            net_artif=Sum("net_artif"),
        )
        return qs


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
