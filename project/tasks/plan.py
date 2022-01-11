from celery import shared_task
import logging

from project.models import Plan

from .utils import import_shp


logger = logging.getLogger(__name__)


@shared_task
def process_new_plan(plan_id):
    logger.info("Start process_new_plan with id=%d", plan_id)
    plan = Plan.objects.get(pk=plan_id)
    try:
        import_shp(plan)
        plan.set_success()
        logger.info("Success ending process_new_plan with id=%d", plan_id)
    except Exception as e:
        logger.exception(f"Unknow exception occured in process_new_plan: {e}")
        plan.set_failed()
        raise e
