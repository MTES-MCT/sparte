import traceback
import tempfile

from pathlib import Path
from celery import shared_task
from zipfile import ZipFile

from django.contrib.gis.utils import LayerMapping
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Project, Emprise


class MissingShpException(Exception):
    pass


@shared_task
def mul(x, y):
    return x * y


def get_shp_file_from_zip(file_stream):
    """Extract all zip files in temporary dir and return .shp file"""
    temp_dir_path = Path(tempfile.TemporaryDirectory().name)
    with ZipFile(file_stream) as zip_file:
        zip_file.extractall(temp_dir_path)  # extract files to dir
    try:
        files_path = [_ for _ in temp_dir_path.iterdir() if _.suffix == ".shp"]
        return files_path[0]
    except IndexError:
        raise MissingShpException("No file with extension .shp found")


def save_feature(shp_file_path, project):
    """save all the feature in Emprise, linked to the current project"""
    # clean previous emprise if any
    project.emprise_set.all().delete()

    # load new features
    mapping = {
        "mpoly": "MULTIPOLYGON",
    }

    class ProxyEmprise(Emprise):
        """Proxy Emprise to set the project foreignkey"""

        def save(self, *args, **kwargs):
            """We set project values thanks to closure."""
            self.project = project
            super().save(*args, **kwargs)

        class Meta:
            proxy = True

    lm = LayerMapping(ProxyEmprise, shp_file_path, mapping)
    lm.save(strict=True)


@shared_task
def import_shp(project_id):
    try:
        # get project instance
        project = get_object_or_404(Project, pk=project_id)
        # set importation datetime
        project.import_date = timezone.now()
        # extract files from zip and get .shp one
        shp_file_path = get_shp_file_from_zip(project.shape_file.open())
        # use .shp to save in the database all the feature
        save_feature(shp_file_path, project)
        # save project with successful import
        project.import_status = Project.IMPORT_SUCCESS
        project.import_error = None
        project.save()
    except Exception as e:  # noqa: F841
        project.import_status = Project.IMPORT_FAILED
        project.import_error = traceback.format_exc()
        project.save()
