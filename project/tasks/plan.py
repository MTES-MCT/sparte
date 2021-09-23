import traceback
import logging

from celery import shared_task

from project.models import PlanEmprise, Plan


logger = logging.getLogger(__name__)


@shared_task
def import_shp(project_id):
    try:
        # get project instance
        project = Project.objects.get(pk=project_id)
        # set importation datetime
        project.import_date = timezone.now()
        # extract files from zip and get .shp one
        shp_file_path = get_shp_file_from_zip(project.shape_file.open())
        # use .shp to save in the database all the feature
        save_feature(shp_file_path, project)
        # save project with successful import
        project.import_status = Project.Status.SUCCESS
        project.import_error = None
        project.save()
        # queue task that will find all communes from emprise
        get_cityes_from_emprise.delay(project_id)
    except Exception as e:  # noqa: F841
        project.import_status = Project.Status.FAILED
        project.import_error = traceback.format_exc()
        project.save()
