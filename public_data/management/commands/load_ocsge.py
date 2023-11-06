import logging
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
    Region,
    ZoneConstruite,
)
from public_data.models.mixins import AutoLoadMixin

logger = logging.getLogger("management.commands")


class AutoOcsgeDiff(AutoLoadMixin, OcsgeDiff):
    class Meta:
        proxy = True

    def before_save(self):
        self.year_new = self.__class__._year_new
        self.year_old = self.__class__._year_old

        self.new_matrix = CouvertureUsageMatrix.matrix_dict()[(self.cs_new, self.us_new)]
        self.new_is_artif = bool(self.new_matrix.is_artificial)

        if self.new_matrix.couverture:
            self.cs_new_label = self.new_matrix.couverture.label

        if self.new_matrix.usage:
            self.us_new_label = self.new_matrix.usage.label

        self.old_matrix = CouvertureUsageMatrix.matrix_dict()[(self.cs_old, self.us_old)]
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


# ##############
#   ARCACHON
# ##############


class ArcachonOcsge(AutoLoadMixin, Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "couverture": "couverture",
        "usage": "usage",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls):
        qs = cls.objects.filter(mpoly__intersects=Departement.objects.get(name="Gironde").mpoly)
        qs = qs.filter(year=cls._year)
        qs.delete()

    def save(self, *args, **kwargs):
        self.year = self.__class__._year
        key = (self.couverture, self.usage)

        if key not in CouvertureUsageMatrix.matrix_dict():
            self.is_artificial = False
            return super().save(*args, **kwargs)

        self.matrix = CouvertureUsageMatrix.matrix_dict()[key]
        self.is_artificial = bool(self.matrix.is_artificial)

        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label

        return super().save(*args, **kwargs)

    @classmethod
    def calculate_fields(cls):
        cls.objects.all().filter(surface__isnull=True).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )


class ArcachonOcsge2015(ArcachonOcsge):
    """
    Données de l'OCSGE pour l'année 2015
    Données fournies par Philippe 09/2021
    python manage.py load_data --class public_data.models.Ocsge2015
    """

    class Meta:
        proxy = True

    shape_file_path = "OCSGE_2015.zip"
    _year = 2015


class ArcachonOcsge2018(ArcachonOcsge):
    class Meta:
        proxy = True

    shape_file_path = "OCSGE_2018.zip"
    _year = 2018


class ArcachonArtif(AutoOcsgeDiff):
    """
    A_B_2015_2018 : la surface (en hectares) artificialisée entre 2015 et 2018
    Données construites par Philippe
    """

    class Meta:
        proxy = True

    shape_file_path = "a_b_2015_2018.zip"
    _year_new = 2018
    _year_old = 2015
    mapping = {
        "surface": "Surface",
        "cs_new": "cs_2018",
        "us_new": "us_2018",
        "cs_old": "cs_2015",
        "us_old": "us_2015",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls):
        qs = cls.objects.filter(mpoly__intersects=Departement.objects.get(name="Gironde").mpoly)
        qs = qs.filter(year_new=cls._year_new, year_old=cls._year_old)
        qs = qs.filter(is_new_natural=False, is_new_artif=True)
        qs.delete()


class ArcachonRenat(ArcachonArtif):
    class Meta:
        proxy = True

    shape_file_path = "a_b_2015_2018.zip"

    @classmethod
    def clean_data(cls):
        qs = cls.objects.filter(mpoly__intersects=Departement.objects.get(name="Gironde").mpoly)
        qs = qs.filter(year_new=cls._year_new, year_old=cls._year_old)
        qs = qs.filter(is_new_natural=True, is_new_artif=False)
        qs.delete()


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

    def save(self, *args, **kwargs):
        key = (self.couverture, self.usage)

        self.matrix = CouvertureUsageMatrix.matrix_dict()[key]
        self.is_artificial = bool(self.matrix.is_artificial)

        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label

        self.year = self.__class__.year

        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        qs = cls.objects.filter(mpoly__intersects=Departement.objects.get(name="Gers").mpoly)
        qs = qs.filter(year=cls.year)
        qs.delete()

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
    year = 2016


class GersOcsge2019(GersOcsge):
    class Meta:
        proxy = True

    shape_file_path = "gers_ocsge_2019.zip"
    year = 2019


class GersOcsgeDiff(AutoOcsgeDiff):
    """
    Email du dev du 06.10.2022: on fait la diff entre le plus récent et celui d'avant.
    avant = 2019, après = 2016
    """

    class Meta:
        proxy = True

    _year_new = 2019
    _year_old = 2016

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
        qs = cls.objects.filter(mpoly__intersects=Departement.objects.get(name="Gers").mpoly)
        qs = qs.filter(year_new=cls._year_new, year_old=cls._year_old)
        qs.delete()


class GersZoneConstruite2016(AutoLoadMixin, ZoneConstruite):
    class Meta:
        proxy = True

    _year = 2016
    shape_file_path = "gers_zone_construite_2016.zip"
    mapping = {
        "id_source": "ID",
        "millesime": "MILLESIME",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs):
        self.year = self._year
        self.surface = self.mpoly.transform(2154, clone=True).area
        super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        qs = cls.objects.filter(mpoly__intersects=Departement.objects.get(name="Gers").mpoly)
        qs = qs.filter(year=cls._year)
        qs.delete()


class GersZoneConstruite2019(GersZoneConstruite2016):
    class Meta:
        proxy = True

    _year = 2019
    shape_file_path = "gers_zone_construite_2019.zip"


# ##########
# BOURGOGNE FRANCHE COMTE
# - Côte-d'Or (21)
# - Doubs (25)
# - Jura (39)
# - Nièvre (58)
# - Haute-Saône (70)
# - Saône-et-Loire (71)
# - Yonne (89)
# - Territoire de Belfort (90)
# ##########


class BourgogneFrancheComteOcsge(AutoLoadMixin, Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "surface": "Shape_Area",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs):
        key = (self.couverture, self.usage)

        self.matrix = CouvertureUsageMatrix.matrix_dict()[key]
        self.is_artificial = bool(self.matrix.is_artificial)

        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label

        self.year = self.__class__.year

        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        qs = (
            cls.objects.all()
            .filter(mpoly__intersects=Region.objects.get(name="Bourgogne-Franche-Comté").mpoly)
            .filter(year=cls.year)
        )
        qs.delete()

    @classmethod
    def calculate_fields(cls):
        cls.objects.all().filter(surface__isnull=True).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )


class CotedorOcsge2010(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Côte-d'Or"
    shape_file_path = "cotedor_ocsge_2010.zip"
    year = 2010


class CotedorOcsge2017(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Côte-d'Or"
    shape_file_path = "cotedor_ocsge_2017.zip"
    year = 2017


class DoubsOcsge2010(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Doubs"
    shape_file_path = "doubs_ocsge_2010.zip"
    year = 2010


class DoubsOcsge2017(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Doubs"
    shape_file_path = "doubs_ocsge_2017.zip"
    year = 2017


class JuraOcsge2010(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Jura"
    shape_file_path = "jura_ocsge_2010.zip"
    year = 2010


class JuraOcsge2017(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Jura"
    shape_file_path = "jura_ocsge_2017.zip"
    year = 2017

    mapping = {
        "id_source": "ID",
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "mpoly": "MULTIPOLYGON",
    }


class NievreOcsge2011(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Nièvre"
    shape_file_path = "nievre_ocsge_2011.zip"
    year = 2011


class NievreOcsge2017(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Nièvre"
    shape_file_path = "nievre_ocsge_2017.zip"
    year = 2017


class HauteSaoneOcsge2011(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Haute-Saône"
    shape_file_path = "haute_saone_ocsge_2011.zip"
    year = 2011


class HauteSaoneOcsge2017(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Haute-Saône"
    shape_file_path = "haute_saone_ocsge_2017.zip"
    year = 2017


class SaoneEtLoireOcsge2011(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Saône-et-Loire"
    shape_file_path = "saone_et_loire_ocsge_2011.zip"
    year = 2011

    mapping = {
        "id_source": "ID",
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "mpoly": "MULTIPOLYGON",
    }


class SaoneEtLoireOcsge2018(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Saône-et-Loire"
    shape_file_path = "saone_et_loire_ocsge_2018.zip"
    year = 2018


class YonneOcsge2011(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Yonne"
    shape_file_path = "yonne_ocsge_2011.zip"
    year = 2011


class YonneOcsge2018(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Yonne"
    shape_file_path = "yonne_ocsge_2018.zip"
    year = 2018


class BelfortOcsge2010(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Territoire de Belfort"
    shape_file_path = "territoire_de_belfort_ocsge_2010.zip"
    year = 2010


class BelfortOcsge2017(BourgogneFrancheComteOcsge):
    class Meta:
        proxy = True

    departement_name = "Territoire de Belfort"
    shape_file_path = "territoire_de_belfort_ocsge_2017.zip"
    year = 2017


class BourgogneFrancheComteOcsgeDiff1017(AutoOcsgeDiff):
    """
    Email du dev du 06.10.2022: on fait la diff entre le plus récent et celui d'avant.
    Avant = 2019, après = 2016
    """

    class Meta:
        proxy = True

    _year_new = 2017
    _year_old = 2010

    @property
    @classmethod
    def departement_name(cls):
        raise NotImplementedError("You must define departement_name")

    mapping = {
        "cs_old": "cs_apres",
        "us_old": "us_apres",
        "cs_new": "cs_avant",
        "us_new": "us_avant",
        "surface": "Shape_Area",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls):
        dept = Departement.objects.get(name=cls.departement_name)

        if not dept:
            raise Exception(f"Departement {cls.departement_name} not found")

        qs = cls.objects.filter(mpoly__intersects=dept.mpoly)
        qs = qs.filter(year_new=cls._year_new, year_old=cls._year_old)
        qs.delete()


class CotedorOcsgeDiff1017(BourgogneFrancheComteOcsgeDiff1017):
    class Meta:
        proxy = True

    _year_new = 2017
    _year_old = 2010
    departement_name = "Côte-d'Or"
    shape_file_path = "cotedor_ocsgediff_1017.zip"


class DoubsOcsgeDiff1017(BourgogneFrancheComteOcsgeDiff1017):
    class Meta:
        proxy = True

    _year_new = 2017
    _year_old = 2010
    departement_name = "Doubs"
    shape_file_path = "doubs_ocsgediff_1017.zip"


class JuraOcsgeDiff1017(BourgogneFrancheComteOcsgeDiff1017):
    class Meta:
        proxy = True

    _year_new = 2017
    _year_old = 2010
    departement_name = "Jura"
    shape_file_path = "jura_ocsgediff_1017.zip"


class NievreOcsgeDiff1017(BourgogneFrancheComteOcsgeDiff1017):
    class Meta:
        proxy = True

    _year_new = 2017
    _year_old = 2011
    departement_name = "Nièvre"
    shape_file_path = "nievre_ocsgediff_1117.zip"


class HauteSaoneOcsgeDiff1017(BourgogneFrancheComteOcsgeDiff1017):
    class Meta:
        proxy = True

    _year_new = 2017
    _year_old = 2011
    departement_name = "Haute-Saône"
    shape_file_path = "hautdesaone_ocsgediff_1117.zip"


class SaoneEtLoireOcsgeDiff1017(BourgogneFrancheComteOcsgeDiff1017):
    class Meta:
        proxy = True

    _year_new = 2018
    _year_old = 2011
    departement_name = "Saône-et-Loire"
    shape_file_path = "saoneetloire_ocsgediff_1118.zip"


class YonneOcsgeDiff1118(BourgogneFrancheComteOcsgeDiff1017):
    class Meta:
        proxy = True

    _year_new = 2018
    _year_old = 2011
    departement_name = "Yonne"
    shape_file_path = "yonne_ocsgediff_1118.zip"


class BelfortOcsgeDiff1017(BourgogneFrancheComteOcsgeDiff1017):
    class Meta:
        proxy = True

    _year_new = 2017
    _year_old = 2011
    departement_name = "Territoire de Belfort"
    shape_file_path = "territoire_de_belfort_ocsgediff_1017.zip"


# Essonne


class EssonneOcsge(AutoLoadMixin, Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "id_source": "ID",
        "mpoly": "MULTIPOLYGON",
        # "source": "SOURCE",
        # "code_or": "CODE_OR",
        # "ossature": "OSSATURE",
        # "id_source": "ID_ORIGINE",
        # "millesime": "MILLESIME",
    }

    def save(self, *args, **kwargs):
        self.year = self.__class__._year
        key = (self.couverture, self.usage)

        if key not in CouvertureUsageMatrix.matrix_dict():
            self.is_artificial = False
            return super().save(*args, **kwargs)

        self.matrix = CouvertureUsageMatrix.matrix_dict()[key]
        self.is_artificial = bool(self.matrix.is_artificial)

        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label

        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        qs = (
            cls.objects.all()
            .filter(mpoly__intersects=Departement.objects.get(name="Essonne").mpoly)
            .filter(year=cls._year)
        )
        qs.delete()


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

    mapping = {
        "id_source": "ID",
        "millesime": "MILLESIME",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs):
        self.year = self._year
        self.surface = self.mpoly.transform(2154, clone=True).area
        super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        qs = cls.objects.filter(mpoly__intersects=Departement.objects.get(name="Essonne").mpoly)
        qs = qs.filter(year=cls._year)
        qs.delete()


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

    shape_file_path = "essonne_diff_2018_2021.zip"

    mapping = {
        "cs_new": "CS_2021",
        "us_new": "US_2021",
        "cs_old": "CS_2018",
        "us_old": "US_2018",
        # "oss_2018": "OSS_2018",
        # "oss_2021": "OSS_2021",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls):
        qs = cls.objects.filter(mpoly__intersects=Departement.objects.get(name="Essonne").mpoly)
        qs = qs.filter(year_new=cls._year_new, year_old=cls._year_old)
        qs.delete()


class SeineEtMarneOcsge(AutoLoadMixin, Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "couverture": "COUVERTURE",
        "usage": "USAGE",
        "mpoly": "MULTIPOLYGON",
        # "millesime": "MILLESIME",
        # "source": "SOURCE",
        # "id_origine": "ID_ORIGINE",
        # "ossature": "OSSATURE",
        # "code_or": "CODE_OR",
    }

    def save(self, *args, **kwargs):
        self.year = self.__class__._year
        key = (self.couverture, self.usage)

        if key not in CouvertureUsageMatrix.matrix_dict():
            self.is_artificial = False
            return super().save(*args, **kwargs)

        self.matrix = CouvertureUsageMatrix.matrix_dict()[key]
        self.is_artificial = bool(self.matrix.is_artificial)

        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label

        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        qs = (
            cls.objects.all()
            .filter(mpoly__intersects=Departement.objects.get(name="Seine-et-Marne").mpoly)
            .filter(year=cls._year)
        )
        qs.delete()


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
        # "zc_type": "ZC_TYPE",
    }

    @staticmethod
    def prepare_shapefile(shape_file_path: Path):
        gdf = geopandas.read_file(shape_file_path)
        gdf["OBJECTID"] = gdf["OBJECTID"].astype(str)
        gdf.to_file(shape_file_path, driver="ESRI Shapefile")

    def save(self, *args, **kwargs):
        self.year = int(self._year)
        self.millesime = str(self._year)
        self.surface = self.mpoly.transform(2154, clone=True).area
        super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls):
        qs = cls.objects.filter(mpoly__intersects=Departement.objects.get(name="Seine-et-Marne").mpoly)
        qs = qs.filter(year=cls._year)
        qs.delete()


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

    shape_file_path = "seine_et_marne_diff_2017_2021.zip"

    mapping = {
        "cs_new": "CS_2021",
        "us_new": "US_2021",
        "cs_old": "CS_2017",
        "us_old": "US_2017",
        "mpoly": "MULTIPOLYGON",
        # "oss_2017": "OSS_2017",
        # "oss_2021": "OSS_2021",
    }

    @classmethod
    def clean_data(cls):
        qs = cls.objects.filter(mpoly__intersects=Departement.objects.get(name="Seine-et-Marne").mpoly)
        qs = qs.filter(year_new=cls._year_new, year_old=cls._year_old)
        qs.delete()


class Command(BaseCommand):
    help = "Load all data from OCS GE"

    def add_arguments(self, parser):
        parser.add_argument(
            "--item",
            type=str,
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
            # BASSIN D'ARCACHON #####
            ArcachonOcsge2018,
            ArcachonOcsge2015,
            ArcachonArtif,
            ArcachonRenat,
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
            items = [i for i in item_list if i.__name__ == item_name_filter]

            if not items:
                raise Exception(f"Item {item_name_filter} not found. Maybe you forgot to add it to the item_list?")

            return self.load(items)

        logger.info("Full load")
        self.load(item_list)
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
