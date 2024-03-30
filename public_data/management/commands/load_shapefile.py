import logging
import subprocess
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from public_data.models import (
    ArtificialArea,
    DataSource,
    Ocsge,
    OcsgeDiff,
    ZoneConstruite,
)
from public_data.shapefile import ShapefileFromSource

logger = logging.getLogger("management.commands")

source_to_table_map = {
    DataSource.DatasetChoices.OCSGE: {
        DataSource.DataNameChoices.OCCUPATION_DU_SOL: Ocsge._meta.db_table,
        DataSource.DataNameChoices.DIFFERENCE: OcsgeDiff._meta.db_table,
        DataSource.DataNameChoices.ZONE_CONSTRUITE: ZoneConstruite._meta.db_table,
        DataSource.DataNameChoices.ZONE_ARTIFICIELLE: ArtificialArea._meta.db_table,
    }
}

field_mapping = {
    DataSource.DatasetChoices.OCSGE: {
        DataSource.DataNameChoices.OCCUPATION_DU_SOL: {
            "id_source": "ID",
            "couverture": "CODE_CS",
            "usage": "CODE_US",
            "year": "YEAR",
            "srid_source": "SRID",
            "is_artificial": "IS_ARTIF",
            "departement": "DPT",
            "surface": "SURFACE",
            "mpoly": "GEOMETRY",
        },
        DataSource.DataNameChoices.DIFFERENCE: {
            "year_old": "YEAR_OLD",
            "year_new": "YEAR_NEW",
            "cs_new": "CS_NEW",
            "cs_old": "CS_OLD",
            "us_new": "US_NEW",
            "us_old": "US_OLD",
            "srid_source": "SRID",
            "surface": "SURFACE",
            "is_new_artif": "NEW_ARTIF",
            "is_new_natural": "NEW_NAT",
            "departement": "DPT",
            "mpoly": "GEOMETRY",
        },
        DataSource.DataNameChoices.ZONE_CONSTRUITE: {
            "id_source": "ID",
            "year": "YEAR",
            "millesime": "MILLESIME",
            "srid_source": "SRID",
            "departement": "DPT",
            "surface": "SURFACE",
            "mpoly": "GEOMETRY",
        },
        DataSource.DataNameChoices.ZONE_ARTIFICIELLE: {
            "year": "YEAR",
            "departement": "DPT",
            "surface": "SURFACE",
            "srid_source": "SRID",
            "city": "CITY",
            "mpoly": "GEOMETRY",
        },
    }
}


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--dataset", type=str, required=True, choices=source_to_table_map.keys())
        parser.add_argument(
            "--name",
            type=str,
            required=False,
            choices=[name for dataset in source_to_table_map for name in source_to_table_map[dataset]],
        )
        parser.add_argument(
            "--land_id",
            type=str,
            help="Departement etc ...",
            required=True,
            choices=set([source.official_land_id for source in DataSource.objects.all()]),
        )

    def get_sources_queryset(self, options):
        sources = DataSource.objects.filter(
            dataset=options.get("dataset"),
            official_land_id=options.get("land_id"),
            productor=DataSource.ProductorChoices.MDA,
        )

        if options.get("name"):
            sources = sources.filter(name=options.get("name"))

        return sources

    def load_shapefile_to_db(
        self,
        shapefile_path: Path,
        source: DataSource,
    ):
        db = settings.DATABASES["default"]

        destination_table_name = source_to_table_map[source.dataset][source.name]
        mapping = field_mapping[source.dataset][source.name]

        command = [
            "ogr2ogr",
            "-dialect",
            "SQLITE",
            "-f",
            '"PostgreSQL"',
            f'"PG:dbname={db["NAME"]} host={db["HOST"]} port={db["PORT"]} user={db["USER"]} password={db["PASSWORD"]}"',  # noqa: E501
            str(shapefile_path.absolute()),
            "-s_srs",
            f"EPSG:{source.srid}",
            "-t_srs",
            "EPSG:4326",
            "--config",
            "PG_USE_COPY",
            "YES",
            "-nlt",
            "PROMOTE_TO_MULTI",
            "-nln",
            destination_table_name,
            "-append",
            "-sql",
            f'"SELECT {", ".join([f"{value} AS {key}" for key, value in mapping.items()])} FROM {source.name}"',
        ]
        subprocess.run(" ".join(command), check=True, shell=True)

    def handle(self, *args, **options) -> None:
        for source in self.get_sources_queryset(options):
            with ShapefileFromSource(source=source) as shapefile_path:
                logger.info("Deleting previously loaded data")
                deleted_count, _ = source.delete_loaded_data()
                logger.info(f"Deleted {deleted_count} previously loaded features")
                logger.info("Loading shapefile to db")
                self.load_shapefile_to_db(
                    shapefile_path=shapefile_path,
                    source=source,
                )
                logger.info("Loaded shapefile to db")
