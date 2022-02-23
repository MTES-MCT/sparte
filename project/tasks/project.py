"""
Asyn tasks runned by Celery

Below functions are dedicated to loading a project data and pre calculate
all the indicators required to speedup process
Current process is :
Step 1 - evaluate emprise from shape file or linked cities
Step 2 - link cities within the emprise (obviously not done when emprise is
         built from it)
Step 3 - Evaluate indicators:
    3.1 - first and last OCSGE millesime available
    3.2 - couverture and usage du sol

There are 3 entry points :
* process_project_with_shape : a shape have been provided steps 1 to 3 will be
                               done
* build_emprise_from_city : a group of cities have been provided and will be
                            used to create emprise. Steps 1 and 3 are done
                            (not 2)
* process_project_with_emprise : project's emprise is already provided and
                                 do not need to be created. Steps 2 and 3
                                 will be done.
"""
from celery import shared_task
import logging

from django.conf import settings
from django.contrib.gis.db.models import Union
from django.contrib.gis.geos.collections import MultiPolygon
from django.urls import reverse

from app_parameter.models import Parameter
from public_data.models import Ocsge
from utils.emails import send_template_email

from project.models import Project, Request

from .utils import import_shp, get_cities_from_emprise


logger = logging.getLogger(__name__)


def get_project(project_id: int) -> Project:
    """Return a project instance or log an error."""
    try:
        return Project.objects.get(pk=project_id)
    except Project.DoesNotExist as e:
        logger.error(f"project_id={project_id} does not exist")
        raise e


@shared_task
def process_project_with_shape(project_id: int):
    """Prep project when emprise is set from a shape file"""
    logger.info("Start process_project_with_shape with id=%d", project_id)
    project = get_project(project_id)
    try:
        logger.info("Shape file=%s", project.shape_file)
        # step 1 - load shape file to build emprise
        import_shp(project)
        # step 2 - only for shape file built emprise
        get_cities_from_emprise(project)
        # step 3 - evaluate indicators
        evaluate_indicators(project)
        # all good !
        project.set_success()
    except Exception as e:
        logger.exception(f"Unknow exception occured in process_project_with_shape: {e}")
        project.set_failed()
        raise e


@shared_task
def build_emprise_from_city(project_id: int):
    """Triggered if no shape file has been provided"""
    logger.info("Start build_emprise_from_city with id=%d", project_id)
    project = get_project(project_id)
    try:
        # step 1 - Create emprise from cities
        project.emprise_set.all().delete()
        qs = project.cities.all()
        if qs.count() == 0:
            # no city available to build emprise
            raise Exception("No city from which to build emprise")
        # make postgis create the union
        qs = qs.aggregate(mpoly=Union("mpoly"))
        # link project and its emprise
        if isinstance(qs["mpoly"], MultiPolygon):
            project.emprise_set.create(mpoly=qs["mpoly"])
        else:
            project.emprise_set.create(mpoly=MultiPolygon(qs["mpoly"]))
        # step 2 - do not do it, cities have been populated previously
        # step 3 - evaluate indicators
        evaluate_indicators(project)
        # all good !
        project.set_success()
    except Exception as e:
        logger.exception(f"Unknow exception occured in build_emprise_from_city: {e}")
        project.set_failed()
        raise e


@shared_task
def process_project_with_emprise(project_id: int):
    """Entry point when a project information have been loaded.
    1. Set the emprise : does a file is available or build from cities ?
    2. Set linked cities
    3. Evaluate floor's 'Usage' and 'Couverture'
    """
    logger.info("Start process_project_with_emprise with id=%d", project_id)
    # get project instance
    project = get_project(project_id)
    try:
        # step 1 : emprise already set, don't do it
        # step 2 - only for shape file built emprise
        get_cities_from_emprise(project)
        # step 3 - evaluate indicators
        evaluate_indicators(project)
        # all good !
        project.set_success()
    except Exception as e:
        logger.exception(
            f"Unknow exception occured in process_project_with_emprise: {e}"
        )
        project.set_failed()
        raise e


@shared_task
def process_project(project_id: int):
    """Will trigger correct processing according to emprise's origine"""
    logger.info("Start process_project with id=%d", project_id)
    # get project instance
    project = get_project(project_id)

    if project.emprise_origin == Project.EmpriseOrigin.FROM_SHP:
        process_project_with_shape(project.id)

    elif project.emprise_origin == Project.EmpriseOrigin.FROM_CITIES:
        build_emprise_from_city(project.id)

    elif project.emprise_origin == Project.EmpriseOrigin.WITH_EMPRISE:
        process_project_with_emprise(project.id)


@shared_task
def evaluate_indicators(project: Project):
    """Evaluate all indicators:
    3.1 - find first and last OCSGE's millesimes
    3.2 - evaluate couverture and usage
    """
    logger.info("Evaluate indicators id=%d", project.id)
    find_first_and_last_ocsge(project)
    evaluate_couverture_and_usage(project)


@shared_task
def find_first_and_last_ocsge(project: Project):
    """Use associated cities to find departements and available OCSGE millesime"""
    logger.info("Find first and last ocsge id=%d", project.id)
    millesimes = {
        millesime
        for city in project.cities.all()
        for millesime in city.get_ocsge_millesimes()
        if int(project.analyse_start_date) <= millesime <= int(project.analyse_end_date)
    }
    if millesimes:
        project.first_year_ocsge = min(millesimes)
        project.last_year_ocsge = max(millesimes)


@shared_task
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
    logger.info("Calculate couverture and usage, id=%s", project.id)
    if isinstance(project, int):
        project = get_project(project)
    geom = project.combined_emprise
    if not geom:
        project.couverture_usage = "Pas d'emprise trouvée."
        project.save(update_fields=["couverture_usage"])
        return
    project.couverture_usage = dict()
    for year in {project.first_year_ocsge, project.last_year_ocsge}:
        project.couverture_usage.update(
            {
                str(year): {
                    "couverture": Ocsge.get_groupby(
                        "couverture", coveredby=geom, year=year
                    ),
                    "usage": Ocsge.get_groupby("usage", coveredby=geom, year=year),
                }
            }
        )
    project.save(update_fields=["couverture_usage"])


@shared_task
def send_email_request_bilan(request_id):
    """Il faut envoyer 2 e-mails: 1 au demandeur et 1 à l'équipe SPARTE"""
    logger.info("Send email to bilan requester (start)")
    logger.info("Request_id=%s", request_id)
    request = Request.objects.get(pk=request_id)
    project_url = f"https://{settings.DOMAIN}{request.project.get_absolute_url()}"
    # send e-mail to requester
    send_template_email(
        subject="Confirmation de demande de bilan",
        recipients=[request.email],
        template_name="project/emails/dl_diagnostic_client",
        context={
            "project": request.project,
            "request": request,
            "project_url": project_url,
        },
    )
    # send e-mail to team
    relative_url = reverse(
        "admin:project_request_change", kwargs={"object_id": request.id}
    )
    send_template_email(
        subject="Nouvelle demande de bilan",
        recipients=[Parameter.objects.str("TEAM_EMAIL")],
        template_name="project/emails/dl_diagnostic_team",
        context={
            "project": request.project,
            "request": request,
            "project_url": project_url,
            "request_url": f"https://{settings.DOMAIN}{relative_url}",
        },
    )
