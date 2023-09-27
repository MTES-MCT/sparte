import logging

from celery import shared_task

from metabase.models import StatDiagnostic

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=5, queue="long")
def async_create_stat_for_project(self, project_id: int, do_location: bool) -> None:
    logger.info("Start async_create_stat_for_project project_id==%d", project_id)
    logger.info("do_location=%s", do_location)
    try:
        StatDiagnostic.project_post_save(project_id, do_location)
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)  # 5 minutes
    finally:
        logger.info("End async_create_stat_for_project project_id=%d", project_id)


@shared_task(bind=True, max_retries=5, queue="long")
def async_create_stat_for_request(self, request_id: int) -> None:
    logger.info("Start async_create_stat_for_request request_id==%d", request_id)
    try:
        StatDiagnostic.request_post_save(request_id)
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)  # 5 minutes
    finally:
        logger.info("End async_create_stat_for_request project_id=%d", request_id)


@shared_task(bind=True, max_retries=5, queue="long")
def async_create_stat_for_trajectory(self, trajectory_id: int) -> None:
    logger.info("Start async_create_stat_for_trajectory trajectory_id==%d", trajectory_id)
    try:
        StatDiagnostic.trajectory_post_save(trajectory_id)
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)  # 5 minutes
    finally:
        logger.info("End async_create_stat_for_request project_id=%d", trajectory_id)
