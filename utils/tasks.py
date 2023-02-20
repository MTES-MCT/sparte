import logging

from celery import shared_task

from utils.emails import send_template_email


logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=5)
def async_send_email(
    self,
    subject: str = "",
    recipients=None,
    template_name="",
    context=None,
    expeditor=None,
):
    logger.info("Start async_send_email")
    logger.info("subject=%s", subject)
    try:
        send_template_email(
            subject=subject,
            recipients=recipients,
            template_name=template_name,
            context=context,
            expeditor=expeditor,
        )
    except Exception as exc:  # pylint: disable=W0703
        logger.error("Error while sending email: %s", exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=2 ** self.request.retries)
