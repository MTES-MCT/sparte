from django.contrib.gis.utils import LayerMapping
from django.core.management.base import BaseCommand
from pathlib import Path

from .models import WorldBorder


class Command(BaseCommand):
    help = "Load worldborders to postgis"

    def handle(self, *args, **options):
        world_mapping = {
            "fips": "FIPS",
            "iso2": "ISO2",
            "iso3": "ISO3",
            "un": "UN",
            "name": "NAME",
            "area": "AREA",
            "pop2005": "POP2005",
            "region": "REGION",
            "subregion": "SUBREGION",
            "lon": "LON",
            "lat": "LAT",
            "mpoly": "MULTIPOLYGON",
        }

        world_shp = (
            Path(__file__).resolve().parent / "media" / "TM_WORLD_BORDERS-0.3.shp"
        )

        lm = LayerMapping(WorldBorder, world_shp, world_mapping, transform=False)
        lm.save(strict=True, verbose=True)
