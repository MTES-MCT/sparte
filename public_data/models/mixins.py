import logging
import numpy as np
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZipFile

from django.contrib.gis.utils import LayerMapping
from django.core.exceptions import FieldDoesNotExist
from django.db.models import OuterRef, Subquery

from utils.colors import get_random_color, get_color_gradient, is_valid

from public_data.storages import DataStorage


logger = logging.getLogger(__name__)


class AutoLoadMixin:
    """
    Enable auto loading of data into database according to
    * shape_file_path - usually shape file is in media directory
    * mapping - between feature name and database field name
    Those two needs to be set in child class.

    SeeAlso::
    - public_data.management.commands.shp2model
    - public_data.management.commands.load_data
    """

    # properties that need to be set when heritating
    couverture_field = None
    usage_field = None
    shape_file_path = Path()
    mapping = dict()

    @classmethod
    def get_shape_file(cls, bucket_file=None):
        # use special storage class to access files in s3://xxx/data directory
        storage = DataStorage()
        if not storage.exists(cls.shape_file_path):
            raise FileNotFoundError(f"s3://xxx/data/{cls.shape_file_path}")
        file_stream = storage.open(cls.shape_file_path)

        # retrieve Zipfile and extract in temporary directory
        temp_dir_path = Path(TemporaryDirectory().name)
        logger.info("Use temp directory %s", temp_dir_path)

        with ZipFile(file_stream) as zip_file:
            zip_file.extractall(temp_dir_path)  # extract files to dir
        logger.info("File copied from bucket and extracted in temp dir")

        # get shape file
        for tempfile in temp_dir_path.iterdir():
            if tempfile.is_file() and tempfile.suffix == ".shp":
                return tempfile

        # no shape file found
        raise FileNotFoundError("No file with .shp suffix")

    @classmethod
    def clean_data(cls, clean_queryset=None):
        """Delete all previous data. Can be overrided, usefull if data are in
        several files"""
        if clean_queryset:
            clean_queryset.delete()
        else:
            cls.objects.all().delete()

    @classmethod
    def load(cls, verbose=True, shp_file=None, bucket_file=None, clean_queryset=None):
        """
        Populate table with data from shapefile then calculate all fields

        Args:
            cls (undefined): default class calling
            verbose=True (undefined): define level of verbosity
        """
        logger.info("Load data of %s", cls)
        if shp_file:
            shp_file = Path(shp_file)
            if not (shp_file.is_file() and shp_file.suffix == ".shp"):
                raise FileNotFoundError("No file with .shp suffix")
        else:
            if bucket_file:
                shp_file = cls.get_shape_file(bucket_file=bucket_file)
            else:
                shp_file = cls.get_shape_file(bucket_file=cls.shape_file_path)
        logger.info("Shape file found: %s", shp_file)
        # # delete previous data
        logger.info("Delete previous data")
        # cls.clean_data(clean_queryset=clean_queryset)
        logger.info("Load new data")
        # # load files
        lm = LayerMapping(cls, shp_file, cls.mapping)
        lm.save(strict=True, verbose=verbose)
        logger.info("Data loaded")
        logger.info("Calculate fields")
        cls.calculate_fields()
        logger.info("End")

    @classmethod
    def calculate_fields(cls):
        """Override if you need to calculate some fields after loading data.
        By default, it will calculate label for couverture and usage if couverture_field
        and usage_field are set with the name of the field containing code (cs.2.1.3)
        """
        if cls.couverture_field:
            from public_data.models import CouvertureSol

            cls.set_label(CouvertureSol, cls.couverture_field, "couverture_label")

        if cls.usage_field:
            from public_data.models import UsageSol

            cls.set_label(UsageSol, cls.usage_field, "usage_label")

    @classmethod
    def set_label(cls, klass, field_code, field_label):
        """Set label field using CouvertureSol or UsageSol référentiel.

        Parameters:
        ===========
        * klass: CouvertureSol or UsageSol
        * field_code: name of the field containing the code (eg. us1.1.1)
        * field_label: name of the field where to save the label
        """
        label = klass.objects.filter(code_prefix=OuterRef(field_code))
        label = label.values("label")[:1]
        update_kwargs = {field_label: Subquery(label)}
        filter_kwargs = {f"{field_label}__isnull": True}
        cls.objects.all().filter(**filter_kwargs).update(**update_kwargs)


class DataColorationMixin:
    """DataColorationMixin add class' methods:
    - get_property_percentile: return percentiles of a property's distribution
    - get_gradient: evaluate percentiles and associate a color gradient

    ..seealso::
    - https://numpy.org/doc/stable/reference/generated/numpy.percentile.html
    """

    # DataColorationMixin properties that need to be set when heritating
    default_property = "surface"  # need to be set correctly to work
    default_color = None

    @classmethod
    def get_gradient(cls, color_name=None, property_name=None):
        # get the numeric scale
        percentiles = cls.get_percentile(property_name=property_name)

        # evaluate how many steps there is in the scale to get same number of color
        nb_colors = len(percentiles) + 1
        # hook for getting a color_name
        color_name = cls.get_color(color_name=color_name)
        # get a gradient of color
        colours = get_color_gradient(color_name=color_name, scale=nb_colors)[::-1]

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
