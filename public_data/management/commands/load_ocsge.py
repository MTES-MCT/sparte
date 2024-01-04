import logging
from typing import Callable, Dict, Tuple

from django.core.management.base import BaseCommand
from django.db.models import Q

from public_data import loaders
from public_data.factories import LayerMapperFactory
from public_data.models import DataSource, Departement

logger = logging.getLogger("management.commands")


def get_departement(name: str) -> Departement:
    return Departement.objects.get(name=name)


@cache
def get_matrix():
    return CouvertureUsageMatrix.matrix_dict()


class AutoOcsgeDiff(AutoLoadMixin, OcsgeDiff):
    class Meta:
        proxy = True

    @classmethod
    @property
    def mapping(cls) -> dict[str, str]:
        return {
            "cs_old": f"CS_{cls._year_old}",
            "us_old": f"US_{cls._year_old}",
            "cs_new": f"CS_{cls._year_new}",
            "us_new": f"US_{cls._year_new}",
            "mpoly": "MULTIPOLYGON",
        }

    def before_save(self):
        self.year_new = self.__class__._year_new
        self.year_old = self.__class__._year_old
        self.departement = self.__class__._departement

        self.new_matrix = get_matrix()[(self.cs_new, self.us_new)]
        self.new_is_artif = bool(self.new_matrix.is_artificial)

        if self.new_matrix.couverture:
            self.cs_new_label = self.new_matrix.couverture.label

        if self.new_matrix.usage:
            self.us_new_label = self.new_matrix.usage.label

        self.old_matrix = get_matrix()[(self.cs_old, self.us_old)]
        self.old_is_artif = bool(self.old_matrix.is_artificial)

        if self.old_matrix.couverture:
            self.cs_old_label = self.old_matrix.couverture.label
        if self.old_matrix.usage:
            self.us_old_label = self.old_matrix.usage.label

        self.is_new_artif = not self.old_is_artif and self.new_is_artif
        self.is_new_natural = self.old_is_artif and not self.new_is_artif

    @classmethod
    def calculate_fields(cls):
        cls.objects.all().filter(surface__isnull=True).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )

    @classmethod
    def clean_data(cls):
        cls.objects.filter(
            departement=cls._departement,
            year_new=cls._year_new,
            year_old=cls._year_old,
        ).delete()


class AutoOcsge(AutoLoadMixin, Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs):
        self.year = self.__class__._year
        self.departement = self.__class__._departement
        key = (self.couverture, self.usage)

        self.matrix = get_matrix()[key]
        self.is_artificial = bool(self.matrix.is_artificial)

        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label

        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).delete()

    @classmethod
    def calculate_fields(cls):
        cls.objects.all().filter(surface__isnull=True).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )


class AutoZoneConstruite(AutoLoadMixin, ZoneConstruite):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "millesime": "MILLESIME",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs):
        self.year = int(self._year)
        self.surface = self.mpoly.transform(2154, clone=True).area
        self.departement = self._departement
        super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).delete()


class GersOcsge2016(AutoOcsge):
    class Meta:
        proxy = True

    shape_file_path = "gers_ocsge_2016.zip"
    _year = 2016
    _departement = get_departement("Gers")


class GersOcsge2019(AutoOcsge):
    class Meta:
        proxy = True

    shape_file_path = "gers_ocsge_2019.zip"
    _year = 2019
    _departement = get_departement("Gers")


class GersOcsgeDiff(AutoOcsgeDiff):
    """
    Email du dev du 06.10.2022: on fait la diff entre le plus récent et celui d'avant.
    avant = 2019, après = 2016
    """

    class Meta:
        proxy = True

    _year_new = 2019
    _year_old = 2016
    _departement = get_departement("Gers")

    shape_file_path = "gers_diff_2016_2019.zip"

    mapping = {
        "cs_old": "cs_apres",
        "us_old": "us_apres",
        "cs_new": "cs_avant",
        "us_new": "us_avant",
        "mpoly": "MULTIPOLYGON",
    }


class GersZoneConstruite2016(AutoZoneConstruite):
    class Meta:
        proxy = True

    _year = 2016
    _departement = get_departement("Gers")

    shape_file_path = "gers_zone_construite_2016.zip"


class GersZoneConstruite2019(AutoZoneConstruite):
    class Meta:
        proxy = True

    _year = 2019
    _departement = get_departement("Gers")

    shape_file_path = "gers_zone_construite_2019.zip"


class EssonneOcsge2018(AutoOcsge):
    class Meta:
        proxy = True

    shape_file_path = "essonne_ocsge_2018.zip"
    _year = 2018
    _departement = get_departement("Essonne")


class EssonneOcsge2021(AutoOcsge):
    class Meta:
        proxy = True

    shape_file_path = "essonne_ocsge_2021.zip"
    _year = 2021
    _departement = get_departement("Essonne")


class EssonneOcsgeZoneConstruite2018(AutoZoneConstruite):
    class Meta:
        proxy = True

    shape_file_path = "essonne_zone_construite_2018.zip"
    _year = 2018
    _departement = get_departement("Essonne")


class EssonneOcsgeZoneConstruite2021(AutoZoneConstruite):
    class Meta:
        proxy = True

    shape_file_path = "essonne_zone_construite_2021.zip"
    _year = 2021
    _departement = get_departement("Essonne")


class EssonneOcsgeDiff1821(AutoOcsgeDiff):
    class Meta:
        proxy = True

    _year_old = 2018
    _year_new = 2021

    _departement = get_departement("Essonne")

    shape_file_path = "essonne_diff_2018_2021.zip"


class SeineEtMarneOcsge(AutoOcsge):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "couverture": "COUVERTURE",
        "usage": "USAGE",
        "mpoly": "MULTIPOLYGON",
    }

    _departement = get_departement("Seine-et-Marne")


class SeineEtMarneOcsge2017(SeineEtMarneOcsge):
    class Meta:
        proxy = True

    shape_file_path = "seine_et_marne_ocsge_2017.zip"
    _year = 2017


class SeineEtMarneOcsge2021(SeineEtMarneOcsge):
    class Meta:
        proxy = True

    shape_file_path = "seine_et_marne_ocsge_2021.zip"
    _year = 2021


class SeineEtMarneOcsgeZoneConstruite(AutoZoneConstruite):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "OBJECTID",
        "mpoly": "MULTIPOLYGON",
    }

    _departement = get_departement("Seine-et-Marne")

    @staticmethod
    def prepare_shapefile(shape_file_path: Path):
        gdf = geopandas.read_file(shape_file_path)
        gdf["OBJECTID"] = gdf["OBJECTID"].astype(str)
        gdf.to_file(shape_file_path, driver="ESRI Shapefile")


class SeineEtMarneOcsgeZoneConstruite2017(SeineEtMarneOcsgeZoneConstruite):
    class Meta:
        proxy = True

    shape_file_path = "seine_et_marne_zone_construite_2017.zip"
    _year = 2017


class SeineEtMarneOcsgeZoneConstruite2021(SeineEtMarneOcsgeZoneConstruite):
    class Meta:
        proxy = True

    shape_file_path = "seine_et_marne_zone_construite_2021.zip"
    _year = 2021


class SeineEtMarneOcsgeDiff1721(AutoOcsgeDiff):
    class Meta:
        proxy = True

    _year_old = 2017
    _year_new = 2021

    _departement = get_departement("Seine-et-Marne")

    shape_file_path = "seine_et_marne_diff_2017_2021.zip"


class HautsDeSeineOcsge2018(AutoOcsge):
    class Meta:
        proxy = True

    shape_file_path = "hauts_de_seine_ocsge_2018_corrige.zip"
    _departement = get_departement("Hauts-de-Seine")
    _year = 2018


class HautsDeSeineOcsge2021(AutoOcsge):
    class Meta:
        proxy = True

    shape_file_path = "hauts_de_seine_ocsge_2021_corrige.zip"
    _departement = get_departement("Hauts-de-Seine")
    _year = 2021


class HautsDeSeineOcsgeZoneConstruite2018(AutoZoneConstruite):
    class Meta:
        proxy = True

    shape_file_path = "hauts_de_seine_zone_construite_2018_corrige.zip"
    _departement = get_departement("Hauts-de-Seine")
    _year = 2018


class HautsDeSeineOcsgeZoneConstruite2021(AutoZoneConstruite):
    class Meta:
        proxy = True

    shape_file_path = "hauts_de_seine_zone_construite_2021_corrige.zip"
    _departement = get_departement("Hauts-de-Seine")
    _year = 2021


class HautsDeSeineOcsgeDiff1821(AutoOcsgeDiff):
    class Meta:
        proxy = True

    _year_old = 2018
    _year_new = 2021

    _departement = get_departement("Hauts-de-Seine")

    shape_file_path = "hauts_de_seine_diff_2018_2021_corrige.zip"


class LandesOcsge2018(AutoOcsge):
    class Meta:
        proxy = True

    shape_file_path = "landes_ocsge_2018.zip"
    _departement = get_departement("Landes")
    _year = 2018


class LandesOcsge2021(AutoOcsge):
    class Meta:
        proxy = True

    shape_file_path = "landes_ocsge_2021.zip"
    _departement = get_departement("Landes")
    _year = 2021


class LandesOcsgeZoneConstruite2018(AutoZoneConstruite):
    class Meta:
        proxy = True

    shape_file_path = "landes_zone_constuite_2018.zip"
    _departement = get_departement("Landes")
    _year = 2018


class LandesOcsgeZoneConstruite2021(AutoZoneConstruite):
    class Meta:
        proxy = True

    shape_file_path = "landes_zone_constuite_2021.zip"
    _departement = get_departement("Landes")
    _year = 2021


class LandesOcsgeDiff1821(AutoOcsgeDiff):
    class Meta:
        proxy = True

    _year_old = 2018
    _year_new = 2021

    _departement = get_departement("Landes")

    shape_file_path = "landes_diff_2018_2021.zip"


class Command(BaseCommand):
    def get_queryset(self):
        return DataSource.objects.filter(
            productor=DataSource.ProductorChoices.IGN,
            dataset=DataSource.DatasetChoices.OCSGE,
        )

    def add_arguments(self, parser):
        parser.add_argument(
            "--departement",
            type=str,
            help="Departement name",
        )
        parser.add_argument(
            "--year-range",
            type=str,
            help="Year range",
        )
        parser.add_argument(
            "--layer-type",
            type=str,
            help="Layer type.",
        )
        parser.add_argument(
            "--all",
            action="store_true",
            help="Load all data",
        )

        parser.add_argument(
            "--list",
            action="store_true",
            help="List available data",
        )

    def handle(self, *args, **options):
        if not options:
            raise ValueError("You must provide at least one option, or use --all to load all data")

        if options.get("list"):
            for source in self.get_queryset():
                print(source)
            return

        item_list = [
            # GERS #####
            GersOcsge2016,
            GersOcsge2019,
            GersOcsgeDiff,
            GersZoneConstruite2016,
            GersZoneConstruite2019,
            # Essonne ####
            EssonneOcsge2018,
            EssonneOcsge2021,
            EssonneOcsgeDiff1821,
            EssonneOcsgeZoneConstruite2018,
            EssonneOcsgeZoneConstruite2021,
            # Seine-et-Marne ####
            SeineEtMarneOcsge2017,
            SeineEtMarneOcsge2021,
            SeineEtMarneOcsgeDiff1721,
            SeineEtMarneOcsgeZoneConstruite2017,
            SeineEtMarneOcsgeZoneConstruite2021,
            # Hauts-de-Seine ####
            HautsDeSeineOcsge2018,
            HautsDeSeineOcsge2021,
            HautsDeSeineOcsgeZoneConstruite2018,
            HautsDeSeineOcsgeZoneConstruite2021,
            HautsDeSeineOcsgeDiff1821,
            # Landes ####
            LandesOcsge2018,
            LandesOcsge2021,
            LandesOcsgeZoneConstruite2018,
            LandesOcsgeZoneConstruite2021,
            LandesOcsgeDiff1821,
        ]

        if options.get("departement"):
            departement_param = options.get("departement")
            departement_queryset = Departement.objects.filter(
                Q(source_id=departement_param) | Q(name__icontains=departement_param)
            )

            if not departement_queryset:
                raise ValueError(f"{departement_param} is not a valid departement")

            departement = departement_queryset.first()

            sources = sources.filter(official_land_id=departement.source_id)

        if options.get("year-range"):
            year_range = options.get("year-range").split(",")
            sources = sources.filter(millesimes__overlap=year_range)

        if options.get("layer-type"):
            sources = sources.filter(name__icontains=options.get("layer-type"))

        if not sources:
            raise ValueError("No data sources found")

        for source in sources:
            layer_mapper_proxy_class = OcsgeFactory(source).get_layer_mapper_proxy_class(module_name=__name__)
            logger.info("Process %s", layer_mapper_proxy_class.__name__)
            layer_mapper_proxy_class.load()
