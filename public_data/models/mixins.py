from logging import DEBUG, INFO, getLogger
from os import getenv
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Dict
from zipfile import ZipFile

import numpy as np
from colour import Color
from django.contrib.gis.utils import LayerMapping
from django.core.exceptions import FieldDoesNotExist
from django.db import connection

from public_data.models.enums import SRID
from public_data.storages import DataStorage
from utils.colors import get_onecolor_gradient, get_random_color, is_valid

logger = getLogger(__name__)

LOCAL_FILE_DIRECTORY = getenv("LOCAL_FILE_DIRECTORY")


class AutoLoadMixin:
    """
    Enable auto loading of data into database according to
    * shape_file_path - usually shape file is in media directory
    * mapping - between feature name and database field name
    Those two needs to be set in child class.
    """

    @property
    def shape_file_path(self) -> str:
        """
        Path to the shapefile to load, either on S3 or locally

        Local path is relative to the env variable LOCAL_FILE_DIRECTORY
        S3 path is relative to the value defined in DataStorage.location

        Example:
        LOCAL_FILE_DIRECTORY = 'public_data/local_data'
        shape_file_path = 'communes/communes-2021-01-01.shp'

        will load the shapefile from public_data/local_data/communes/communes-2021-01-01.shp
        """
        raise NotImplementedError("The shape_file_path property must be set in child class")

    @property
    def mapping(self) -> Dict[str, str]:
        """
        Mapping between shapefile fields and model fields
        for geodjango's LayerMapping
        """
        raise NotImplementedError("The mapping property must be set in child class")

    @property
    def srid(self) -> int:
        """
        SRID of the source shapefile
        Defaults to LAMBERT_93, override if needed.

        NOTE: getting the SRID from the shapefile is not 100% reliable
        hence the need to set it manually.
        """
        return SRID.LAMBERT_93

    def before_save(self) -> None:
        if hasattr(self.__class__, "srid_source"):
            self.srid_source = self.__class__.srid

    def save(self, *args, **kwargs):
        self.before_save()
        super().save(*args, **kwargs)
        self.after_save()
        return self

    def after_save(self) -> None:
        """Hook to do things after saving"""

    @classmethod
    def calculate_fields(cls) -> None:
        """Override if you need to calculate some fields after loading data."""

    @staticmethod
    def prepare_shapefile(shape_file_path: Path) -> None:
        """Hook that prepares shapefile before loading it into database
        Useful to modify shapefile fields type before mapping

        Note that this method will update in place in case
        a local file is used. If the shapefile is retrieved from S3,
        it will update the file from the temporary directory it
        is extracted to.

        Args:
            shape_file_path: path to the shapefile to prepare
            (provided by the load method)
        """

    def __check_path_is_a_regular_file(path: Path) -> None:
        if not path.is_file():
            raise FileNotFoundError(f"{path} is not a regular file")

    @staticmethod
    def __check_path_suffix_is_shapefile(path: Path) -> None:
        if path.suffix != ".shp":
            raise FileNotFoundError(f"{path} is not a shapefile")

    def __check_prj_file_exists(path: Path) -> None:
        prj_file_path = path.with_suffix(suffix=".prj")

        if not prj_file_path.exists():
            raise FileNotFoundError(f"{prj_file_path} is missing")

    @classmethod
    def __check_is_shape_file(cls, shape_file_path: Path) -> None:
        cls.__check_path_is_a_regular_file(shape_file_path)
        cls.__check_path_suffix_is_shapefile(shape_file_path)
        cls.__check_prj_file_exists(shape_file_path)

    def __retrieve_zipped_shapefile_from_s3(
        file_name_on_s3: str,
        output_path: Path,
    ) -> Path:
        storage = DataStorage()

        if not storage.exists(file_name_on_s3):
            raise FileNotFoundError(f"{file_name_on_s3} could not be found on S3")

        output_zip_path = f"{output_path}/{file_name_on_s3}"

        storage.bucket.download_file(
            Key=f"{storage.location}/{file_name_on_s3}",
            Filename=output_zip_path,
        )

        return output_zip_path

    def __extract_zipped_shapefile(
        zipped_shapefile_path: Path,
        output_path: Path,
    ) -> Path:
        with ZipFile(zipped_shapefile_path) as zip_file:
            zip_file.extractall(output_path)

        return output_path

    def __get_shapefile_path_from_folder(folder_path: Path) -> Path:
        for tempfile in folder_path.rglob("*.shp"):
            if tempfile.name.startswith("._"):
                continue

            return tempfile

        raise FileNotFoundError("No file with .shp suffix")

    @classmethod
    def clean_data(cls) -> None:
        """Delete previously loaded data

        The implementation of the method should ensure idempotency
        by removing entirely and exclusively the data previously loaded
        by the child class
        """
        raise NotImplementedError(f"No clean_data method implemented for the class {cls.__name__}")

    @classmethod
    def load(
        cls,
        local_file_path=None,
        local_file_directory=LOCAL_FILE_DIRECTORY,
        verbose=True,
        layer_mapper_strict=True,
        layer_mapper_silent=False,
        layer_mapper_encoding="utf-8",
        layer_mapper_step=1000,
    ) -> None:
        """Populate table with data from shapefile then calculate all fields

        If no local_file_path is provided, the shapefile is downloaded from S3,
        and then extracted in a temporary directory.

        All arguments are optional and only affects how LayerMapper behave
        LayerMapper documentation:
        - https://docs.djangoproject.com/en/4.2/ref/contrib/gis/layermapping/

        Args:
            verbose: print more information
            local_file_path: path to a local shapefile
            local_file_directory: directory where to find the local shapefile
            layer_mapper_strict: raise exception if a field is missing
            layer_mapper_silent: do not print anything
            layer_mapper_encoding: encoding of the shapefile
            layer_mapper_step: number of rows to process at once

        Raises:
            FileNotFoundError: if the shapefile is not found on S3 or locally
            NotImplementedError: if the child class does not implement the shape_file_path property
        """

        logger.setLevel(DEBUG if verbose else INFO)

        logger.info("Loading data from class %s", cls.__name__)

        with TemporaryDirectory() as temporary_directory:
            if not local_file_path:
                logger.info("Retrieving zipped shapefile from S3")

                zipped_shapefile_path = cls.__retrieve_zipped_shapefile_from_s3(
                    file_name_on_s3=cls.shape_file_path,
                    output_path=Path(temporary_directory),
                )
                logger.debug(f"Zipped shapefile temporary path: {zipped_shapefile_path}")

                logger.debug("Extracting zipped shapefile")

                shapefile_folder_path = cls.__extract_zipped_shapefile(
                    zipped_shapefile_path=zipped_shapefile_path,
                    output_path=Path(temporary_directory),
                )

                logger.debug(f"Extracted shapefile folder path: {shapefile_folder_path}")

                shape_file_path = cls.__get_shapefile_path_from_folder(shapefile_folder_path)
            else:
                logger.info("Using local shapefile")

                shape_file_path = Path(f"{local_file_directory}/{local_file_path}")

            logger.info("Shapefile path: %s", shape_file_path)

            cls.__check_is_shape_file(shape_file_path)

            logger.debug("Shapefile is valid ✅")

            logger.info("Preparing shapefile")

            cls.prepare_shapefile(shape_file_path)

            logger.info("Cleaning previously loaded data")

            cls.clean_data()

            logger.info("Setting up LayerMapper")

            layer_mapper = LayerMapping(
                model=cls,
                data=shape_file_path,
                mapping=cls.mapping,
                encoding=layer_mapper_encoding,
                transaction_mode="commit_on_success",
            )

            logger.info("Saving mapped entities")

            layer_mapper.save(
                strict=layer_mapper_strict,
                silent=layer_mapper_silent,
                verbose=verbose,
                progress=True,
                step=layer_mapper_step,
            )

            logger.info("Calculating fields")

            cls.calculate_fields()

        logger.info("Done loading data from class %s", cls.__name__)


class DataColorationMixin:
    """DataColorationMixin add class' methods:
    - get_property_percentile: return percentiles of a property's distribution
    - get_gradient: evaluate percentiles and associate a color gradient

    ..seealso::
    - https://numpy.org/doc/stable/reference/generated/numpy.percentile.html
    """

    # DataColorationMixin properties that need to be set when heritating
    default_property = "surface"  # need to be set correctly to work
    default_color: str = ""

    @classmethod
    def get_gradient(cls, color_name=None, property_name=None):
        # get the numeric scale
        percentiles = cls.get_percentile(property_name=property_name)

        # evaluate how many steps there is in the scale to get same number of color
        nb_colors = len(percentiles) + 1
        # hook for getting a color_name
        color_name = cls.get_color(color_name=color_name)
        # get a gradient of color

        colours = get_onecolor_gradient(Color(color_name), nb_colors)[::-1]

        # add colors to the scale
        gradient = {
            0: colours.pop(0),
        }
        for percentile in percentiles:
            gradient[percentile] = colours.pop(0)

        return gradient

    @classmethod
    def get_color(cls, color_name=None):
        # keep color_name if one is provided else try to use default_color
        if not color_name:
            color_name = cls.default_color
        # if color is known by the lib return it
        # else a color is chosen randomly
        if is_valid(color_name):
            return color_name
        else:
            return get_random_color()

    @classmethod
    def get_property_data(cls, property_name=None):
        qs = cls.objects.all()
        qs = qs.values_list(property_name)
        qs = qs.order_by(property_name)
        return list(qs)

    @classmethod
    def get_percentile(cls, property_name=None, percentiles=None):
        """
        Return decile scale of the specified property
        Deciles are the 9 values that divide  distribution in 10 equal parts

        Args:
            property_name=self.default_property: a name of a field of the model
            if not provided, uses self.default_property
            percentiles=boundaries (between 0 - 100) to compute
        """
        try:
            # will raise an exception if field does not exist or is None
            cls._meta.get_field(property_name)
        except FieldDoesNotExist:
            # Question: ne faudrait-il pas plutôt crasher
            # violement si le field n'existe pas ?
            property_name = cls.default_property

        if not percentiles:
            percentiles = range(10, 100, 10)
        rows = cls.get_property_data(property_name=property_name)
        if not rows:
            return None
        else:
            return np.percentile(rows, percentiles, interpolation="lower")


class TruncateTableMixin:
    """enable a truncate statement (compatible only with PostgreSQL so far)"""

    @classmethod
    def truncate(cls, restart_id=True):
        query = f'TRUNCATE TABLE "{cls._meta.db_table}"'
        if restart_id:
            query += " RESTART IDENTITY"
        with connection.cursor() as cursor:
            cursor.execute(query)
