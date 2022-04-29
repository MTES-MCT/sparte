import logging

from django.core.management.base import BaseCommand

from public_data.models import Ocsge, Departement, OcsgeDiff


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


class Command(BaseCommand):
    help = "Load all data from gers territory"

    # def add_arguments(self, parser):
    #     parser.add_argument(
    #         "--class",
    #         type=str,
    #         help="class name that need to be reloaded",
    #     )
    #     parser.add_argument(
    #         "--verbose",
    #         action="store_true",
    #         help="To activate verbose mode of LayerMapping",
    #     )

    def handle(self, *args, **options):
        logger.info("Load Gers OCSGE")
        logger.info("Millesime=2016")
        # GersOcsge2016.load(shp_file="media/gers/OCCUPATION_SOL_2016.shp", verbose=True)
        logger.info("Millesime=2019")
        GersOcsge2019.load(shp_file="media/gers/OCCUPATION_SOL_2019.shp", verbose=False)
        logger.info("Millesime=Diff")
        # GersOcsgeDiff.load(shp_file="media/gers/DIFF_2016_2019.shp", verbose=False)
        logger.info("End loading Gers OCSGE")
