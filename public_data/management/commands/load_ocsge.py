import logging

from django.contrib.gis.db.models.functions import Area, Transform
from django.core.management.base import BaseCommand
from django.db.models import DecimalField
from django.db.models.functions import Cast

from public_data.models import (
    AutoLoadMixin,
    CouvertureSol,
    CouvertureUsageMatrix,
    Departement,
    Ocsge,
    OcsgeDiff,
    UsageSol,
    ZoneConstruite,
)


logger = logging.getLogger("management.commands")


USAGE_LIST = {usage.code_prefix: usage for usage in UsageSol.objects.all()}
COUVERTURE_LIST = {
    couverture.code_prefix: couverture for couverture in CouvertureSol.objects.all()
}
MATRIX_LIST = dict()
qs = CouvertureUsageMatrix.objects.all().select_related("usage", "couverture")
for item in qs:
    key = (
        item.couverture.code_prefix if item.couverture else None,
        item.usage.code_prefix if item.usage else None,
    )
    MATRIX_LIST[key] = item
GIRONDE = Departement.objects.get(name="Gironde")
GERS = Departement.objects.get(name="Gers")


# #######
# ADD FUNCTION TO LOAD DATA
# #######


class AutoOcsgeDiff(AutoLoadMixin, OcsgeDiff):
    class Meta:
        proxy = True

    def before_save(self):
        self.year_new = self.__class__._year_new
        self.year_old = self.__class__._year_old

        self.new_matrix = MATRIX_LIST[(self.cs_new, self.us_new)]
        self.new_is_artif = bool(self.new_matrix.is_artificial)
        if self.new_matrix.couverture:
            self.cs_new_label = self.new_matrix.couverture.label
        if self.new_matrix.usage:
            self.us_new_label = self.new_matrix.usage.label

        self.old_matrix = MATRIX_LIST[(self.cs_old, self.us_old)]
        if self.old_matrix.couverture:
            self.cs_old_label = self.old_matrix.couverture.label
        if self.old_matrix.usage:
            self.us_old_label = self.old_matrix.usage.label
        self.old_is_artif = bool(self.old_matrix.is_artificial)

        self.is_new_artif = not self.old_is_artif and self.new_is_artif
        self.is_new_natural = self.old_is_artif and not self.new_is_artif

    @classmethod
    def calculate_fields(cls):
        """override to hook specific label setting."""
        # update surface field
        cls.objects.all().filter(surface__isnull=True).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )


# ##############
#   ARCACHON
# ##############


class ArcachonOcsge2015(AutoLoadMixin, Ocsge):
    """
    Données de l'OCSGE pour l'année 2015
    Données fournies par Philippe 09/2021
    python manage.py load_data --class public_data.models.Ocsge2015
    """

    class Meta:
        proxy = True

    shape_file_path = "OCSGE_2015.zip"
    _year = 2015
    mapping = {
        "couverture": "couverture",
        "usage": "usage",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls, clean_queryset=None):
        """Delete only data with year=2015"""
        # select only data covered by Gironde
        qs = cls.objects.filter(mpoly__intersects=GIRONDE.mpoly)
        # only current millesime
        qs = qs.filter(year=cls._year)
        qs.delete()

    def save(self, *args, **kwargs):
        self.year = self.__class__._year
        key = (self.couverture, self.usage)
        try:
            self.matrix = MATRIX_LIST[key]
            self.is_artificial = bool(self.matrix.is_artificial)
            if self.matrix.couverture:
                self.couverture_label = self.matrix.couverture.label
            if self.matrix.usage:
                self.usage_label = self.matrix.usage.label
        except KeyError:
            self.is_artificial = False
        return super().save(*args, **kwargs)

    @classmethod
    def calculate_fields(cls):
        """Override if you need to calculate some fields after loading data.
        By default, it will calculate label for couverture and usage if couverture_field
        and usage_field are set with the name of the field containing code (cs.2.1.3)
        """
        cls.objects.all().filter(surface__isnull=True).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )


class ArcachonOcsge2018(ArcachonOcsge2015):
    shape_file_path = "OCSGE_2018.zip"
    _year = 2018

    class Meta:
        proxy = True


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
    def clean_data(cls, clean_queryset=None):
        # select only data covered by Gironde
        qs = cls.objects.filter(mpoly__intersects=GIRONDE.mpoly)
        # only current millesime
        qs = qs.filter(year_new=cls._year_new, year_old=cls._year_old)
        qs = qs.filter(is_new_natural=False, is_new_artif=True)
        qs.delete()


class ArcachonRenat(ArcachonArtif):
    class Meta:
        proxy = True

    shape_file_path = "a_b_2015_2018.zip"

    @classmethod
    def clean_data(cls, clean_queryset=None):
        # select only data covered by Gironde
        qs = cls.objects.filter(mpoly__intersects=GIRONDE.mpoly)
        # only current millesime
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
        self.matrix = MATRIX_LIST[key]
        self.is_artificial = bool(self.matrix.is_artificial)
        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label
        self.year = self.__class__.year
        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls, clean_queryset=None):
        """Delete only data with year=2015"""
        # select only data covered by Gers
        qs = cls.objects.filter(mpoly__intersects=GERS.mpoly)
        # only current millesime
        qs = qs.filter(year=cls.year)
        qs.delete()

    @classmethod
    def calculate_fields(cls):
        """Override if you need to calculate some fields after loading data.
        By default, it will calculate label for couverture and usage if couverture_field
        and usage_field are set with the name of the field containing code (cs.2.1.3)
        """
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
    class Meta:
        proxy = True

    _year_new = 2019
    _year_old = 2016

    shape_file_path = "gers_diff_2016_2019.zip"
    # Email du dev du 06.10.2022
    # on fait la diff entre le plus récent et celui d'avant.
    # avant = 2019, après = 2016
    mapping = {
        "cs_old": "cs_apres",
        "us_old": "us_apres",
        "cs_new": "cs_avant",
        "us_new": "us_avant",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls, clean_queryset=None):
        # select only data covered by Gers
        qs = cls.objects.filter(mpoly__intersects=GERS.mpoly)
        # only current millesime
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
        # surface
        self.surface = self.mpoly.transform(2154, clone=True).area
        # get density
        # self.set_built_density()
        super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls, clean_queryset=None):
        # select only data covered by Gers
        qs = cls.objects.filter(mpoly__intersects=GERS.mpoly)
        # only current millesime
        qs = qs.filter(year=cls._year)
        qs.delete()

    # @classmethod
    # def calculate_fields(cls):
    #     """Set year field, surface and density"""
    #     year
    #     cls.objects.filter(year__isnull=True).update(
    #         year=Cast("millesime", output_field=IntegerField())
    #     )
    #     surface
    #     cls.objects.filter(surface__isnull=True).update(
    #         surface=Cast(
    #             Area(Transform("mpoly", 2154)),
    #             DecimalField(max_digits=15, decimal_places=4),
    #         )
    #     )


class GersZoneConstruite2019(GersZoneConstruite2016):
    _year = 2019
    shape_file_path = "gers_zone_construite_2019.zip"

    class Meta:
        proxy = True


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
    year = 2010

    class Meta:
        proxy = True

    def save(self, *args, **kwargs):
        key = (self.couverture, self.usage)
        self.matrix = MATRIX_LIST[key]
        self.is_artificial = bool(self.matrix.is_artificial)
        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label
        self.year = self.__class__.year
        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls, clean_queryset=None):
        """Delete only data with year=2015"""
        # select only data covered by departement
        dept = Departement.objects.get(name=cls.departement_name)
        qs = (
            cls.objects.all().filter(mpoly__intersects=dept.mpoly).filter(year=cls.year)
        )
        qs.delete()

    @classmethod
    def calculate_fields(cls):
        """Override if you need to calculate some fields after loading data.
        By default, it will calculate label for couverture and usage if couverture_field
        and usage_field are set with the name of the field containing code (cs.2.1.3)
        """
        cls.objects.all().filter(surface__isnull=True).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )

    mapping = {
        "id_source": "ID",
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "surface": "Shape_Area",
        "mpoly": "MULTIPOLYGON",
    }


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
    class Meta:
        proxy = True

    _year_new = 2017
    _year_old = 2010
    departement_name = "Côte-d'Or"

    shape_file_path = "gers_diff_2016_2019.zip"
    # Email du dev du 06.10.2022
    # on fait la diff entre le plus récent et celui d'avant.
    # avant = 2019, après = 2016
    mapping = {
        "cs_old": "cs_apres",
        "us_old": "us_apres",
        "cs_new": "cs_avant",
        "us_new": "us_avant",
        "surface": "Shape_Area",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls, clean_queryset=None):
        # select only data covered by Gers
        dept = Departement.objects.get(name=cls.departement_name)
        qs = cls.objects.filter(mpoly__intersects=dept.mpoly)
        # only current millesime
        qs = qs.filter(year_new=cls._year_new, year_old=cls._year_old)
        qs.delete()


class CotedorOcsgeDiff1017(BourgogneFrancheComteOcsgeDiff1017):
    class Meta:
        proxy = True

    _year_new = 2017
    _year_old = 2010
    departement_name = "Côte-d'Or"
    shape_file_path = "cotedor_ocsgediff_1017.zip"


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
            help=(
                "if you want to completly restart tables including id, not compatible "
                "with --item"
            ),
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
            ArcachonOcsge2018,
            ArcachonOcsge2015,
            ArcachonArtif,
            ArcachonRenat,
            GersOcsge2016,
            GersOcsge2019,
            GersOcsgeDiff,
            GersZoneConstruite2016,
            GersZoneConstruite2019,
            CotedorOcsge2010,
            CotedorOcsge2017,
            DoubsOcsge2010,
            DoubsOcsge2017,
            JuraOcsge2010,
            JuraOcsge2017,
            NievreOcsge2011,
            NievreOcsge2017,
            HauteSaoneOcsge2011,
            HauteSaoneOcsge2017,
            SaoneEtLoireOcsge2011,
            SaoneEtLoireOcsge2018,
            YonneOcsge2011,
            YonneOcsge2018,
            BelfortOcsge2010,
            BelfortOcsge2017,
            CotedorOcsgeDiff1017,
        ]
        if options["item"]:
            self.load([i for i in item_list if i.__name__ == options["item"]])
        else:
            logger.info("Full load")
            if options["truncate"]:
                self.truncate()
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
