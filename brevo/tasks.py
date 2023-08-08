import logging

from celery import shared_task

from brevo.connectors import Brevo
from project.models import Project, Request
from users.models import User
from utils.decorators import log_function

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=5)
@log_function(logger)
def send_user_subscription_to_brevo(self, user_id: int) -> None:
    """Send subscription information to Brevo."""
    try:
        Brevo().after_subscription(User.objects.get(pk=user_id))
    except User.DoesNotExist:
        logger.error(f"user_id={user_id} does not exist")
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=5)
@log_function(logger)
def send_request_to_brevo(self, request_id: int) -> None:
    """Send subscription information to Brevo."""
    try:
        Brevo().after_request(Request.objects.get(pk=request_id))
    except Request.DoesNotExist:
        logger.error(f"request_id={request_id} does not exist")
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=5)
@log_function(logger)
def send_diagnostic_to_brevo(self, project_id: int) -> None:
    """Send subscription information to Brevo."""
    try:
        project = Project.objects.get(pk=project_id)
        if project.user:
            Brevo().after_diagnostic_creation(project)
    except Request.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=60)
