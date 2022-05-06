import logging

from django.core.management.base import BaseCommand

from public_data.models import Ocsge, Departement, OcsgeDiff, ZoneConstruite


logger = logging.getLogger("management.commands")


class GersOcsge(Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "millesime_source": "MILLESIME",
        "source": "SOURCE",
        "ossature": "OSSATURE",
        "id_origine": "ID_ORIGINE",
        "code_or": "CODE_OR",
        "mpoly": "MULTIPOLYGON",
    }
    default_color = "Chocolate"

    def save(self, *args, **kwargs):
        self.year = self.__class__.year
        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls, clean_queryset=None):
        """Delete only data with year=2015"""
        gers = Departement.objects.get(id=33)
        # select only data covered by Gers
        qs = cls.objects.filter(mpoly__intersects=gers.mpoly)
        # only current millesime
        qs = qs.filter(year=cls.year)
        qs.delete()


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


class GersOcsgeDiff(OcsgeDiff):
    class Meta:
        proxy = True

    _year_new = 2019
    _year_old = 2016

    shape_file_path = "gers_diff_2016_2019.zip"  # "media/gers/DIFF_2016_2019.zip"

    def save(self, *args, **kwargs):
        self.year_new = self.__class__._year_new
        self.year_old = self.__class__._year_old
        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls, clean_queryset=None):
        """Delete only data with year=2015"""
        gers = Departement.objects.get(id=33)
        # select only data covered by Gers
        qs = cls.objects.filter(mpoly__intersects=gers.mpoly)
        # only current millesime
        qs = qs.filter(year_new=cls._year_new, year_old=cls._year_old)
        qs.delete()


class ZoneConstruite2016(ZoneConstruite):
    _year = 2016
    shape_file_path = "gers_zone_construite_2016.zip"

    class Meta:
        proxy = True

    def save(self, *args, **kwargs):
        self.year = self._year
        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls, clean_queryset=None):
        gers = Departement.objects.get(id=33)
        # select only data covered by Gers
        qs = cls.objects.filter(mpoly__intersects=gers.mpoly)
        # only current millesime
        qs = qs.filter(year=cls._year)
        qs.delete()


class ZoneConstruite2019(ZoneConstruite2016):
    _year = 2019
    shape_file_path = "gers_zone_construite_2019.zip"

    class Meta:
        proxy = True


class Command(BaseCommand):
    help = "Load all data from gers territory"

    def add_arguments(self, parser):
        parser.add_argument(
            "--test",
            action="store_true",
            help="To activate verbose mode of LayerMapping",
        )

    def handle(self, *args, **options):
        logger.info("Load Gers OCSGE")
        if options["test"]:
            self.test()
        else:
            self.prod()
        logger.info("End loading Gers OCSGE")

    def test(self):
        logger.info("MODE TEST")
        # GersOcsge2016.load(shp_file="media/gers/OCCUPATION_SOL_2016.shp", verbose=True)
        # GersOcsge2019.load(shp_file="media/gers/OCCUPATION_SOL_2019.shp", verbose=True)
        # GersOcsgeDiff.load(shp_file="media/gers/DIFF_2016_2019.shp", verbose=True)
        ZoneConstruite2019.load(shp_file="media/gers/ZONE_CONSTRUITE_2019.shp")

    def prod(self):
        logger.info("Millesime=2016")
        GersOcsge2016.load()
        logger.info("Millesime=2019")
        GersOcsge2019.load()
        logger.info("Millesime=Diff")
        GersOcsgeDiff.load()
        logger.info("Zones construites=2016")
        ZoneConstruite2016.load()
        logger.info("Zones construites=2019")
        ZoneConstruite2019.load()
