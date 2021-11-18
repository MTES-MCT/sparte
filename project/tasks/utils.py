"""Below are usefull function that should work with Project and Plan instances."""
import logging
import tempfile
from pathlib import Path
from zipfile import ZipFile

from django.contrib.gis.db.models.functions import Intersection, Area, Transform
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.utils import LayerMapping
from django.db.models import F

from public_data.models import CommunesSybarval, ArtifCommune


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
    layer_fields_set = set(layer_fields)
    model_mapping_set = set(model_mapping.values())
    fields = layer_fields_set.intersection(model_mapping_set)
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


def get_cities_from_emprise(base_project):
    """Analyse emprise to find which CommuneSybarval is include inside and make
    a relation between the project and ArtifCommunes"""
    logger.info("Get cities from emprise")
    base_project.cities.clear()
    geom = base_project.combined_emprise
    # get all communes intersecting the emprise
    # but intersect will get commune sharing only very little with emprise
    # therefor we will filter to keep only commune with more than 95% of
    # its surface in the emprise
    qs = CommunesSybarval.objects.filter(mpoly__intersects=geom)
    qs = qs.annotate(intersection=Transform(Intersection("mpoly", geom), 2154))
    qs = qs.annotate(intersection_area=Area("intersection"))
    qs = qs.annotate(area=Area(Transform("mpoly", 2154)))
    qs = qs.filter(intersection_area__gt=F("area") * 0.95)
    code_insee = qs.values_list("code_insee", flat=True).distinct()
    cities = ArtifCommune.objects.filter(insee__in=code_insee)
    base_project.cities.add(*cities)
