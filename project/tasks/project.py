"""
Asyn tasks runned by Celery

Below functions are dedicated to loading a project data and pre calculate
all the indicators required to speedup process
Current process is :
1- Create a new project (or drop any 'emprise')
2- select an emprise form cities, known organization or shape file
    => end of this step mean project as emprise instances (at least one)
3- linked project (or plan) to covered cities
4- Evaluate indicators:
  * couverture and usage du sol
"""
from celery import shared_task
import logging

from django.contrib.gis.db.models import Union

from public_data.models import CommunesSybarval, Ocsge2015, Ocsge2018

from project.models import Project

from .utils import import_shp, get_cities_from_emprise


logger = logging.getLogger(__name__)


@shared_task
def process_new_project(project_id: int):
    """Entry point when a project information have been loaded.
    1. Set the emprise : does a file is available or build from cities ?
    2. Set linked cities
    3. Evaluate floor's 'Usage' and 'Couverture'
    """
    logger.info("Start process_new_project with id=%d", project_id)
    # get project instance
    project = get_project(project_id)
    try:
        # step 1 : evaluate emprise
        # choose between shape file or list of city to build emprise
        logger.info("Shape file=%s", project.shape_file)
        if project.shape_file is not None:
            import_shp(project)
            # step 2 - only for shape file built emprise
            get_cities_from_emprise(project)
        else:
            build_emprise_from_city(project)
        # step 3 - evaluate couverture and usage
        evaluate_couverture_and_usage(project)
        # all good !
        project.set_success()
    except Exception as e:
        logger.exception(f"Unknow exception occured in process_new_project: {e}")
        project.set_failed()
        raise e


def get_project(project_id: int) -> Project:
    """Return a project instance or log an error."""
    try:
        return Project.objects.get(pk=project_id)
    except Project.DoesNotExist as e:
        logger.error(f"project_id={project_id} does not exist")
        raise e


def build_emprise_from_city(project: Project):
    # clean previous emprise if any
    project.emprise_set.all().delete()
    # get all INSEE codes to find according CommunesSybarval
    qs_insee = project.cities.all().values_list("insee", flat=True)
    qs = CommunesSybarval.objects.filter(code_insee__in=qs_insee)
    # make postgis create the union
    qs = qs.aggregate(mpoly=Union("mpoly"))
    # link project and its emprise
    project.emprise_set.create(mpoly=qs["mpoly"])


def evaluate_couverture_and_usage(project: Project):
    """Calculate couverture and usage of the floor of the project.
    it evaluates covering with Ocasge2015 and 2018 and for couverture and usage

    Saving format is:
    {
        '2015': {  # millésime
            'couverture': {  # covering type
                'cs1.1.1': 123,  # code and area in km square
                'cs1.1.2': 23,
            },
            'usage': { ... },  # same as couverture
        },
        '2018': { ... },  # same as 2015
    }
    """
    logger.info("Calculate couverture and usage")
    if isinstance(project, int):  # debug only
        project = get_project(project)
    geom = project.combined_emprise
    data = {
        "2015": {
            "couverture": Ocsge2015.get_groupby("couverture", coveredby=geom),
            "usage": Ocsge2015.get_groupby("usage", coveredby=geom),
        },
        "2018": {
            "couverture": Ocsge2018.get_groupby("couverture", coveredby=geom),
            "usage": Ocsge2018.get_groupby("usage", coveredby=geom),
        },
    }
    project.couverture_usage = data
    project.save(update_fields=["couverture_usage"])
