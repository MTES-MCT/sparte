import logging

from celery import shared_task

from users.connectors import BrevoContact
from users.models import User

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=5)
def send_user_subscription_to_brevo(self, user_id: int) -> None:
    """Send subscription information to Brevo."""
    logger.info("Start send_user_subscription_to_brevo, user_id==%d", user_id)
    try:
        user = User.objects.get(pk=user_id)
        BrevoContact().after_subscription(user)
    except User.DoesNotExist:
        logger.error(f"user_id={user_id} does not exist")
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=60)
    finally:
        logger.info("End send_user_subscription_to_brevo, user_id=%d", user_id)
