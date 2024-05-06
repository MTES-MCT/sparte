from logging import Logger, getLogger
from os import mkdir
from pathlib import Path
from urllib.request import urlretrieve
from uuid import uuid4
from zipfile import ZipFile

import py7zr
from storages.backends.s3boto3 import S3Boto3Storage

from public_data.models import DataSource
from public_data.storages import DataStorage


def __download_source(
    source: DataSource,
    output_path: Path,
    storage: S3Boto3Storage,
) -> Path:
    file_name_on_s3 = source.path

    if not storage.exists(file_name_on_s3):
        raise FileNotFoundError(f"{file_name_on_s3} could not be found on S3")

    output_zip_path = f"{output_path.name}/{file_name_on_s3}"

    storage.bucket.download_file(
        Key=f"{storage.location}/{file_name_on_s3}",
        Filename=output_zip_path,
    )

    return Path(output_zip_path)


def __download_url(
    url: str,
    output_path: Path,
) -> Path:
    filename_from_url = url.split("/")[-1]

    output_zip_path = f"{output_path.name}/{filename_from_url}"

    urlretrieve(
        url=url,
        filename=output_zip_path,
    )

    return Path(output_zip_path)


def __extract_7z_shapefile(
    zipped_shapefile_path: Path,
    output_path: Path,
) -> Path:
    zipped_shapefile_path_without_suffix = zipped_shapefile_path.stem.split(".")[0]
    output_path = Path(f"{output_path}/{zipped_shapefile_path_without_suffix}")

    archive = py7zr.SevenZipFile(zipped_shapefile_path, mode="r")
    archive.extractall(path=output_path.absolute())
    archive.close()

    return output_path


def __extract_zipped_shapefile(
    zipped_shapefile_path: Path,
    output_path: Path,
) -> Path:
    zipped_shapefile_path_without_suffix = zipped_shapefile_path.stem.split(".")[0]
    output_path = Path(f"{output_path}/{zipped_shapefile_path_without_suffix}")

    with ZipFile(file=zipped_shapefile_path) as zip_file:
        zip_file.extractall(path=output_path.absolute())

    return output_path


def __get_shapefile_path_from_folder(shapefile_directory: Path, pattern="*.shp") -> Path:
    for tempfile in shapefile_directory.rglob(pattern=pattern):
        if tempfile.name.startswith("."):
            # Skip hidden files
            continue
        if not tempfile.name.endswith(".shp"):
            # Skip files that contains shp in their name, but do not end with .shp (e.g. shp.zip)
            continue
        return tempfile

    raise FileNotFoundError(f"No file with .shp suffix found in {shapefile_directory}")


def delete_directory(pth: Path):
    for sub in pth.iterdir():
        if sub.is_dir():
            delete_directory(sub)
        else:
            sub.unlink()
    pth.rmdir()


def get_shapefile_from_source(
    storage: DataStorage,
    source: DataSource,
    output_path: Path,
    logger: Logger,
) -> tuple[Path, Path, Path]:
    logger.info("Downloading shapefile")
    zipped_shapefile_path = __download_source(storage=storage, source=source, output_path=output_path)
    logger.info(f"Downloaded shapefile to {zipped_shapefile_path}")
    logger.info(msg="Extracting shapefile")
    shapefile_directory = __extract_zipped_shapefile(
        zipped_shapefile_path=zipped_shapefile_path,
        output_path=output_path,
    )
    logger.info(f"Extracted shapefile to {shapefile_directory}")

    shapefile_path = __get_shapefile_path_from_folder(shapefile_directory=shapefile_directory)
    logger.info(f"Shapefile path: {shapefile_path}")

    return shapefile_path, shapefile_directory, zipped_shapefile_path


def get_shapefile_from_url(
    url: str,
    output_path: Path,
    logger: Logger,
    shapefile_name: str = None,
):
    logger.info("Downloading shapefile")
    zipped_shapefile_path = __download_url(url=url, output_path=output_path)
    logger.info(f"Downloaded shapefile to {zipped_shapefile_path}")
    logger.info(msg="Extracting shapefile")
    shapefile_directory = __extract_7z_shapefile(
        zipped_shapefile_path=zipped_shapefile_path,
        output_path=output_path,
    )
    logger.info(f"Extracted shapefile to {shapefile_directory}")

    shapefile_path = __get_shapefile_path_from_folder(shapefile_directory=shapefile_directory, pattern=shapefile_name)
    logger.info(f"Shapefile path: {shapefile_path}")

    return shapefile_path, shapefile_directory, zipped_shapefile_path


class ShapefileFromSource:
    def __init__(self, source: DataSource, logger_name="management.commands") -> None:
        self.storage = DataStorage()
        self.source = source
        self.output_path = Path("tmp" + str(uuid4()))
        self.shapefile_path = None
        self.shapefile_directory = None
        self.zipped_shapefile_path = None
        self.logger = getLogger(logger_name)

    def __enter__(self) -> Path:
        mkdir(path=self.output_path)
        shapefile_path, shapefile_directory, zipped_shapefile_path = get_shapefile_from_source(
            source=self.source,
            output_path=self.output_path,
            storage=self.storage,
            logger=self.logger,
        )
        self.shapefile_path = shapefile_path
        self.shapefile_directory = shapefile_directory
        self.zipped_shapefile_path = zipped_shapefile_path
        return self.shapefile_path

    def __exit__(self, exc_type, exc_val, exc_tb):
        delete_directory(self.output_path)


class ShapefileFromURL:
    def __init__(
        self,
        url: str,
        logger_name="management.commands",
        shapefile_name: str = None,
    ) -> None:
        self.url = url
        self.shapefile_name = shapefile_name
        self.output_path = Path("tmp" + str(uuid4()))
        self.shapefile_path = None
        self.shapefile_directory = None
        self.zipped_shapefile_path = None
        self.logger = getLogger(logger_name)

    def __enter__(self) -> Path:
        mkdir(path=self.output_path)
        shapefile_path, shapefile_directory, zipped_shapefile_path = get_shapefile_from_url(
            url=self.url,
            output_path=self.output_path,
            logger=self.logger,
            shapefile_name=self.shapefile_name,
        )
        self.shapefile_path = shapefile_path
        self.shapefile_directory = shapefile_directory
        self.zipped_shapefile_path = zipped_shapefile_path
        return self.shapefile_path

    def __exit__(self, exc_type, exc_val, exc_tb):
        delete_directory(self.output_path)
