"""
Asyn tasks runned by Celery

Below functions are dedicated to loading a project data and pre calculate
all the indicators required to speedup process
Current process is :
1- Create a new project (or drop any 'emprise')
2- select an emprise form cities, known organization or shape file
    => end of this step mean project as emprise instances (at least one)
3- linked project (or plan) to covered cities
4- Evaluate indicators (none at the moment)
"""
import logging

from celery import shared_task

from django.contrib.gis.db.models import Union

from public_data.models import CommunesSybarval

from project.models import Project

from .utils import import_shp


logger = logging.getLogger(__name__)


def get_project(project_id):
    """Return a project instance or log an error."""
    try:
        return Project.objects.get(pk=project_id)
    except Project.DoesNotExist as e:
        logger.error(f"project_id={project_id} does not exist")
        raise e


@shared_task
def import_project_shp(project_id):
    """step 2 for a project. Import emprise from a shape file."""
    logger.info("%d import_project_shp", project_id)
    # get project instance
    project = get_project(project_id)
    try:
        # open zipfile and use load shape's features into Emprise
        import_shp(project)
        # save project on successful import (no exception raised)
        project.set_success()
    except Exception as e:
        logger.exception(f"Unknow exception occured in import_project_shp: {e}")
        project.set_failed()
        raise e


@shared_task
def build_emprise_from_city(project_id):
    project = get_project(project_id)

    try:
        # clean previous emprise if any
        project.emprise_set.all().delete()
        # get all INSEE codes to find according CommunesSybarval
        qs_insee = project.cities.all().values_list("insee", flat=True)
        qs = CommunesSybarval.objects.filter(code_insee__in=qs_insee)
        # make postgis create the union
        qs = qs.aggregate(mpoly=Union("mpoly"))
        # link project and its emprise
        project.emprise_set.create(mpoly=qs["mpoly"])
        project.set_success()
    except Exception as e:
        project.set_failed()
        logger.error(f"project_id={project_id} can't make emprise")
        raise e
