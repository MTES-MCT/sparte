import logging
from functools import cache
from pathlib import Path

import geopandas
from django.contrib.gis.db.models.functions import Area, Transform
from django.core.management.base import BaseCommand
from django.db.models import DecimalField
from django.db.models.functions import Cast

from public_data.models import (
    CouvertureUsageMatrix,
    Departement,
    Ocsge,
    OcsgeDiff,
    ZoneConstruite,
)
from public_data.models.mixins import AutoLoadMixin

logger = logging.getLogger("management.commands")


def get_departement(name: str) -> Departement:
    return Departement.objects.get(name=name)


@cache
def get_matrix():
    return CouvertureUsageMatrix.matrix_dict()


class AutoOcsgeDiff(AutoLoadMixin, OcsgeDiff):
    class Meta:
        proxy = True

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


# ##########
#   GERS
# ##########


class GersOcsge(AutoLoadMixin, Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "mpoly": "MULTIPOLYGON",
    }

    _departement = get_departement("Gers")

    def save(self, *args, **kwargs):
        self.departement = self._departement
        key = (self.couverture, self.usage)

        self.matrix = get_matrix()[key]
        self.is_artificial = bool(self.matrix.is_artificial)

        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label

        self.year = self.__class__._year

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


class GersOcsge2016(GersOcsge):
    class Meta:
        proxy = True

    shape_file_path = "gers_ocsge_2016.zip"
    _year = 2016


class GersOcsge2019(GersOcsge):
    class Meta:
        proxy = True

    shape_file_path = "gers_ocsge_2019.zip"
    _year = 2019


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

    @classmethod
    def clean_data(cls):
        cls.objects.filter(
            departement=cls._departement,
            year_new=cls._year_new,
            year_old=cls._year_old,
        ).delete()


class GersZoneConstruite2016(AutoLoadMixin, ZoneConstruite):
    class Meta:
        proxy = True

    _year = 2016
    _departement = get_departement("Gers")

    shape_file_path = "gers_zone_construite_2016.zip"
    mapping = {
        "id_source": "ID",
        "millesime": "MILLESIME",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs):
        self.year = self._year
        self.departement = self._departement
        self.surface = self.mpoly.transform(2154, clone=True).area
        super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).delete()


class GersZoneConstruite2019(GersZoneConstruite2016):
    class Meta:
        proxy = True

    _year = 2019
    shape_file_path = "gers_zone_construite_2019.zip"


# Essonne


class EssonneOcsge(AutoLoadMixin, Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "id_source": "ID",
        "mpoly": "MULTIPOLYGON",
    }

    _departement = get_departement("Essonne")

    def save(self, *args, **kwargs):
        self.year = self.__class__._year
        self.departement = self._departement
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


class EssonneOcsge2018(EssonneOcsge):
    class Meta:
        proxy = True

    shape_file_path = "essonne_ocsge_2018.zip"
    _year = 2018


class EssonneOcsge2021(EssonneOcsge):
    class Meta:
        proxy = True

    shape_file_path = "essonne_ocsge_2021.zip"
    _year = 2021


class EssonneOcsgeZoneConstruite(AutoLoadMixin, ZoneConstruite):
    class Meta:
        proxy = True

    _departement = get_departement("Essonne")

    mapping = {
        "id_source": "ID",
        "millesime": "MILLESIME",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs):
        self.year = self._year
        self.departement = self._departement
        self.surface = self.mpoly.transform(2154, clone=True).area
        super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).delete()


class EssonneOcsgeZoneConstruite2018(EssonneOcsgeZoneConstruite):
    class Meta:
        proxy = True

    shape_file_path = "essonne_zone_construite_2018.zip"
    _year = 2018


class EssonneOcsgeZoneConstruite2021(EssonneOcsgeZoneConstruite):
    class Meta:
        proxy = True

    shape_file_path = "essonne_zone_construite_2021.zip"
    _year = 2021


class EssonneOcsgeDiff1821(AutoOcsgeDiff):
    class Meta:
        proxy = True

    _year_old = 2018
    _year_new = 2021

    _departement = get_departement("Essonne")

    shape_file_path = "essonne_diff_2018_2021.zip"

    mapping = {
        "cs_new": "CS_2021",
        "us_new": "US_2021",
        "cs_old": "CS_2018",
        "us_old": "US_2018",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls):
        cls.objects.filter(
            departement=cls._departement,
            year_new=cls._year_new,
            year_old=cls._year_old,
        ).delete()


class SeineEtMarneOcsge(AutoLoadMixin, Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "couverture": "COUVERTURE",
        "usage": "USAGE",
        "mpoly": "MULTIPOLYGON",
    }

    _departement = get_departement("Seine-et-Marne")

    def save(self, *args, **kwargs):
        self.year = self.__class__._year
        self.departement = self._departement
        key = (self.couverture, self.usage)

        if key not in get_matrix():
            self.is_artificial = False
            return super().save(*args, **kwargs)

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


class SeineEtMarneOcsgeZoneConstruite(AutoLoadMixin, ZoneConstruite):
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

    def save(self, *args, **kwargs):
        self.year = int(self._year)
        self.millesime = str(self._year)
        self.surface = self.mpoly.transform(2154, clone=True).area
        self.departement = self._departement
        super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).delete()


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

    mapping = {
        "cs_new": "CS_2021",
        "us_new": "US_2021",
        "cs_old": "CS_2017",
        "us_old": "US_2017",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls):
        cls.objects.filter(
            departement=cls._departement,
            year_new=cls._year_new,
            year_old=cls._year_old,
        ).delete()


class Command(BaseCommand):
    help = "Load all data from OCS GE"

    def add_arguments(self, parser):
        parser.add_argument(
            "--item",
            type=str,
            nargs="+",
            help="item that you want to load ex: GersOcsge2016, ZoneConstruite2019...",
        )
        parser.add_argument(
            "--truncate",
            action="store_true",
            help=("if you want to completly restart tables including id, not compatible " "with --item"),
        )
        parser.add_argument(
            "--describe",
            action="store_true",
            help="Show shape file features'",
        )
        parser.add_argument(
            "--no-verbose",
            action="store_true",
            help="reduce output",
        )

    def handle(self, *args, **options):
        logger.info("Load OCSGE")

        self.verbose = not options["no_verbose"]

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
        ]

        if options.get("truncate"):
            logger.info("Full truncate OCSGE")
            self.truncate()
            logger.info("End truncate OCSGE")

        item_name_filter = options.get("item")

        if item_name_filter:
            # first check all args are good
            for item in item_name_filter:
                if item not in [i.__name__ for i in item_list]:
                    raise Exception(f"Item {item} not found. Maybe you forgot to add it to the item_list?")
            # make a list of corresponding class
            items = [i for i in item_list if i.__name__ in item_name_filter]
        else:
            items = item_list

        logger.info("Full load")
        self.load(items)
        logger.info("End loading OCSGE")

    def truncate(self):
        logger.info("Truncate Ocsge, OcsgeDiff and ZoneConstruite")

        Ocsge.truncate()
        OcsgeDiff.truncate()
        ZoneConstruite.truncate()

    def load(self, item_list):
        logger.info("Items to load: %d", len(item_list))

        for item in item_list:
            logger.info("Load data for: %s", item.__name__)
            item.load(verbose=self.verbose)
