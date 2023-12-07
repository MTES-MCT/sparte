"""Below are usefull function that should work with Project and Plan instances."""
import logging
import tempfile
from pathlib import Path
from zipfile import ZipFile

from django.contrib.gis.gdal import DataSource
from django.contrib.gis.utils import LayerMapping

logger = logging.getLogger(__name__)


class MissingShpException(Exception):
    pass


def get_shp_file_from_zip(file_stream):
    """Extract all zip files in temporary dir and return .shp file"""
    logger.info("get_shp_file_from_zip")
    temp_dir_path = Path(tempfile.TemporaryDirectory().name)
    logger.info("Use temp dir=%s", temp_dir_path)
    with ZipFile(file_stream) as zip_file:
        zip_file.extractall(temp_dir_path)  # extract files to dir
    try:
        files_path = [_ for _ in temp_dir_path.iterdir() if _.suffix == ".shp"]
        logger.info("Found shape file=%s", files_path[0])
        return files_path[0]
    except IndexError as e:
        logger.exception(f"Exception in get_shp_file_from_zip: {e}")
        raise MissingShpException("No file with extension .shp found")


def get_available_mapping(layer_fields: list(), model_mapping: dict()) -> dict():
    # make a set of the field available in the layer
    layer_fields_set = set(layer_fields)
    # make a set of the excpected mapping (from the model)
    model_mapping_set = set(model_mapping.values())
    # get the intersection, the field in common
    fields = layer_fields_set.intersection(model_mapping_set)
    # add required polygon field to save the polygon
    fields = fields.union(set(["MULTIPOLYGON"]))
    mapping = {k: v for k, v in model_mapping.items() if v in fields}
    return mapping


def save_feature(shp_file_path, base_project):
    """save all the feature in Emprise, linked to the current project
    base_project: Project or Plan instance
    """
    logger.info("Save features in database")

    # open datasource and fetch available fields
    ds = DataSource(shp_file_path)

    # load new features
    mapping = base_project.emprise_set.model.mapping
    mapping = get_available_mapping(ds[0].fields, mapping)

    class ProxyEmprise(base_project.emprise_set.model):
        """Proxy Emprise to set the project foreignkey"""

        def save(self, *args, **kwargs):
            """We set project values thanks to closure."""
            self.set_parent(base_project)
            super().save(*args, **kwargs)

        class Meta:
            proxy = True

    lm = LayerMapping(ProxyEmprise, ds, mapping)
    lm.save(strict=True)


def import_shp(base_project):
    """Step 2: load emprise from a shape file provided for a project or a plan"""
    # clean previous emprise if any
    base_project.emprise_set.all().delete()
    # extract files from zip and get .shp one
    shp_file_path = get_shp_file_from_zip(base_project.shape_file.open())
    # use .shp to save in the database all the feature
    save_feature(shp_file_path, base_project)
