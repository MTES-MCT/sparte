import logging
import subprocess
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZipFile

from django.conf import settings
from django.core.management.base import BaseCommand

from public_data.models import DataSource, Departement
from public_data.storages import DataStorage

logger = logging.getLogger("management.commands")

source_to_table_map = {
    DataSource.DatasetChoices.OCSGE: {
        DataSource.DataNameChoices.OCCUPATION_DU_SOL: "public_data_ocsge",
    }
}


def get_field_mapping(source: DataSource) -> dict[str, str]:
    return {
        DataSource.DatasetChoices.OCSGE: {
            DataSource.DataNameChoices.OCCUPATION_DU_SOL: {
                "id_source": "ID",
                "couverture": "CODE_CS",
                "usage": "CODE_US",
                "year": f"'{source.millesimes[0]}'",
                "srid_source": f"'{source.srid}'",
                "is_artificial": "cast(IS_ARTIF AS boolean)",
                "departement": f"'{source.official_land_id}'",
                "surface": "OGR_GEOM_AREA",
            }
        }
    }[source.dataset][source.name]


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
            "--departement",
            type=str,
            help="Departement id",
            required=True,
            choices=[departement.source_id for departement in Departement.objects.all()],
        )

        parser.add_argument(
            "--year-range",
            type=str,
            help="Year range",
            required=False,
        )

    def download_source(
        self,
        source: DataSource,
        output_path: str,
    ) -> Path:
        file_name_on_s3 = source.path
        storage = DataStorage()

        if not storage.exists(file_name_on_s3):
            raise FileNotFoundError(f"{file_name_on_s3} could not be found on S3")

        output_zip_path = f"{output_path}/{file_name_on_s3}"

        storage.bucket.download_file(
            Key=f"{storage.location}/{file_name_on_s3}",
            Filename=output_zip_path,
        )

        return Path(output_zip_path)

    def extract_zipped_shapefile(
        self,
        zipped_shapefile_path: Path,
        output_path: Path,
    ) -> Path:
        with ZipFile(file=zipped_shapefile_path) as zip_file:
            zip_file.extractall(path=output_path)

        return output_path

    def get_shapefile_path_from_folder(self, folder_path: Path) -> Path:
        for tempfile in folder_path.rglob("*.shp"):
            if tempfile.name.startswith("._"):
                continue

            return tempfile

        raise FileNotFoundError("No file with .shp suffix")

    def load_shapefile_to_db(
        self,
        shapefile_path: Path,
        source: DataSource,
    ):
        db = settings.DATABASES["default"]

        destination_table_name = source_to_table_map[source.dataset][source.name]
        mapping = get_field_mapping(source)

        sql_mapping = (
            "SELECT "
            + ", ".join([f"{value} AS {key}" for key, value in mapping.items()])
            + f" FROM {shapefile_path.stem}"
        )
        pg_connection = f"dbname='{db['NAME']}' host='{db['HOST']}' port='{db['PORT']}' user='{db['USER']}' password='{db['PASSWORD']}'"  # noqa E501
        ogr2ogr_options = f'--config PG_USE_COPY YES -nln {destination_table_name} -nlt PROMOTE_TO_MULTI -makevalid -append -sql "{sql_mapping}"'  # noqa E501
        command = f'ogr2ogr -f PostgreSQL PG:"{pg_connection}" {shapefile_path} {ogr2ogr_options}'

        subprocess.run(command, shell=True, check=True)

    def get_sources_queryset(self, options):
        sources = DataSource.objects.filter(
            dataset=options.get("dataset"), official_land_id=options.get("departement")
        )

        if options.get("name"):
            sources = sources.filter(name=options.get("name"))

        if options.get("year_range"):
            year_range_as_list = options.get("year_range").split("-")
            start = year_range_as_list[0]
            end = year_range_as_list[1]
            year_range = range(int(start), int(end) + 1)
            sources = sources.filter(millesimes__overlap=year_range)

        return sources

    def handle(self, *args, **options):
        sources = self.get_sources_queryset(options)

        if not sources:
            return

        for source in sources:
            with TemporaryDirectory() as temporary_directory:
                logger.info("Downloading shapefile")
                zipped_shapefile_path = self.download_source(
                    source=source,
                    output_path=temporary_directory,
                )
                logger.info(f"Downloaded shapefile to {zipped_shapefile_path}")
                logger.info(msg="Extracting shapefile")
                shapefile_directory = self.extract_zipped_shapefile(
                    zipped_shapefile_path=zipped_shapefile_path,
                    output_path=Path(temporary_directory),
                )
                logger.info(f"Extracted shapefile to {shapefile_directory}")

                shapefile_path = Path(f"{shapefile_directory}/{Path(source.path).with_suffix('.shp')}")
                logger.info(f"Shapefile path: {shapefile_path}")
                logger.info("Loading shapefile to db")
                self.load_shapefile_to_db(
                    shapefile_path=shapefile_path,
                    source=source,
                )
                logger.info("Loaded shapefile to db")
