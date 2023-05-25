import logging
from pathlib import Path

from django.contrib.gis.db.models.functions import Area, Transform
from django.core.management.base import BaseCommand
from django.db import connection
from django.db.models import DecimalField
from django.db.models.functions import Cast

from public_data.models import (
    AutoLoadMixin,
    ZoneUrba,
)

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
        "typezone": "typezone",
        "destdomi": "destdomi",
        "nomfic": "nomfic",
        "urlfic": "urlfic",
        "insee": "insee",
        "datappro": "datappro",
        "datvalid": "datvalid",
        "idurba": "idurba",
        "idzone": "idzone",
        "lib_idzone": "lib_idzone",
        "mpoly": "MULTIPOLYGON",
    }

    @classmethod
    def clean_data(cls, clean_queryset=None):
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
        # TODO : insee, surface
        make_valid_mpoly_query = (
            "UPDATE public_data_zoneurba pdz "
            "SET mpoly = ST_Multi(ST_CollectionExtract(ST_MakeValid(mpoly), 3)) "
            "WHERE ST_IsValid(mpoly) IS FALSE "
            "    AND ST_IsValid(ST_MakeValid(mpoly))"
        )
        with connection.cursor() as cursor:
            cursor.execute(make_valid_mpoly_query)
        cls.objects.filter(surface__isnull=True).update(
            area=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )


class Command(BaseCommand):
    help = "Load all data from OCS GE"

    def add_arguments(self, parser):
        # parser.add_argument(
        #     "--item",
        #     type=str,
        #     help="item that you want to load ex: GersOcsge2016, ZoneConstruite2019...",
        # )
        parser.add_argument(
            "--truncate",
            action="store_true",
            help=("if you want to completly restart tables including id, not compatible " "with --item"),
        )
        # parser.add_argument(
        #     "--describe",
        #     action="store_true",
        #     help="Show shape file features'",
        # )
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
        self.local_file = options["local_file"]
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
        ZoneUrbaFrance.load(verbose=self.verbose, shp_file=self.local_file, encoding="latin1", silent=True)
