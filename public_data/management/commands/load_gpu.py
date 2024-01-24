import logging
from pathlib import Path

from django.contrib.gis.db.models.functions import Area
from django.core.management.base import BaseCommand
from django.db import connection
from django.db.models import DecimalField, F
from django.db.models.functions import Cast

from public_data.models import ZoneUrba
from public_data.models.mixins import AutoLoadMixin
from utils.db import DynamicSRIDTransform

logger = logging.getLogger("management.commands")


# ##############
#   ZoneUrba France entière
# ##############


class ZoneUrbaFrance(AutoLoadMixin, ZoneUrba):
    """
    Zone urbaines France entière
    Données récupérées sur le FTP: sftp-public.ign.fr
    Date de téléchargement : mai 2023
    """

    class Meta:
        proxy = True

    shape_file_path = Path("public_data/GPU/zone_urba.shp")
    mapping = {
        "gid": "gid",
        "partition": "partition",
        "libelle": "libelle",
        "libelong": "libelong",
        "origin_typezone": "typezone",
        "destdomi": "destdomi",
        "nomfic": "nomfic",
        "urlfic": "urlfic",
        "origin_insee": "insee",
        "datappro": "datappro",
        "datvalid": "datvalid",
        "idurba": "idurba",
        "idzone": "idzone",
        "lib_idzone": "lib_idzone",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls):
        """Clean data before loading"""
        cls.objects.all().delete()

    def save(self, *args, **kwargs):
        return super().save(*args, **kwargs)

    @classmethod
    def calculate_fields(cls):
        """Override if you need to calculate some fields after loading data.
        By default, it will calculate label for couverture and usage if couverture_field
        and usage_field are set with the name of the field containing code (cs.2.1.3)
        """
        # TODO : insee, surface, type_zone
        logger.info("Calculate fields")
        logger.info("Make mpoly valid")
        make_valid_mpoly_query = (
            "UPDATE public_data_zoneurba pdz "
            "SET mpoly = ST_Multi(ST_CollectionExtract(ST_MakeValid(mpoly), 3)) "
            "WHERE ST_IsValid(mpoly) IS FALSE "
            "    AND ST_IsValid(ST_MakeValid(mpoly))"
        )
        with connection.cursor() as cursor:
            cursor.execute(make_valid_mpoly_query)
        logger.info("Evaluate area")

        cls.objects.filter(area__isnull=True).update(
            area=Cast(
                Area(DynamicSRIDTransform("mpoly", "srid_source")) / 10000,
                DecimalField(max_digits=15, decimal_places=4),
            )
        )

        logger.info("Clean typezone")
        cls.objects.update(origin_typezone=F("typezone"))
        cls.objects.filter(typezone__in=["Nh", "Nd"]).update(typezone="N")
        cls.objects.filter(typezone="Ah").update(typezone="A")
        logger.info("Fill up table ZoneUrbaArtificialArea")
        artif_area_query = """
            INSERT INTO public_data_artifareazoneurba (zone_urba_id, year, area)
            SELECT
                pdz.id,
                pdo.year,
                ST_Area(ST_Transform(ST_Union(ST_Intersection(ST_MakeValid(pdo.mpoly), pdz.mpoly)), pdz.srid_source))
                / 10000
                AS artificial_area
            FROM
                public_data_zoneurba pdz
            LEFT JOIN
                public_data_artifareazoneurba pda
            ON pda.zone_urba_id = pdz.id
            INNER JOIN
                public_data_ocsge pdo
            ON ST_Intersects(pdo.mpoly, pdz.mpoly) AND is_artificial = true
            WHERE pda.id is null
            GROUP BY pdz.id, pdo.year;
        """
        with connection.cursor() as cursor:
            cursor.execute(artif_area_query)


class Command(BaseCommand):
    help = "Load all data from OCS GE"

    def add_arguments(self, parser):
        parser.add_argument(
            "--truncate",
            action="store_true",
            help="if you want to completly restart tables including id, not compatible " "with --item",
        )
        parser.add_argument(
            "--verbose",
            action="store_true",
            help="increase output",
        )
        parser.add_argument(
            "--local-file",
            type=str,
            help="Use local file instead of s3",
        )

    def handle(self, *args, **options):
        logger.info("Load GPU")
        self.verbose = options["verbose"]
        logger.info("Full load")
        if options["truncate"]:
            self.truncate()
        self.load()
        logger.info("End loading GPU")

    def truncate(self):
        logger.info("Truncate ZoneUrbaFrance")
        ZoneUrbaFrance.truncate()

    def load(self):
        logger.info("Load data for: ZoneUrbaFrance")

        ZoneUrbaFrance.load(
            verbose=self.verbose,
            encoding="latin1",
            silent=True,
        )

        logger.info("End loading ZoneUrbaFrance")
