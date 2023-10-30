import logging

from celery import shared_task
from django_app_parameter import app_parameter

from utils.emails import SibTemplateEmail

from .models import AliveTimeStamp, ContactForm, Newsletter

logger = logging.getLogger(__name__)


@shared_task
def send_contact_form(contact_form_id):
    logger.info("Send contact email to team")
    logger.info("contact_email_id=%s", contact_form_id)
    contact_form = ContactForm.objects.get(pk=contact_form_id)
    try:
        email = SibTemplateEmail(
            template_id=9,
            recipients=[{"Name": "Equipe Mon Diagnostic Artificialisation", "email": app_parameter.TEAM_EMAIL}],
            params={
                "content_html": contact_form.content.replace("\n", "<br/>"),
                "sender": contact_form.email,
            },
        )
        logger.info(email.send())
        contact_form.success()
    except Exception as exc:  # noqa: E722, B001
        logger.error("Failing sending email")
        logger.exception(exc)
        contact_form.handle_exception()
    finally:
        logger.info("End send contact email to team")


@shared_task
def send_nwl_confirmation(newsletter_id):
    logger.info("Send newsletter subscription confirmation request")
    logger.info("newsletter_id=%s", newsletter_id)
    nwl = Newsletter.objects.get(pk=newsletter_id)
    try:
        email = SibTemplateEmail(
            template_id=7,
            recipients=[{"email": nwl.email}],
            params={"url": nwl.get_confirmation_url()},
        )
        logger.info(email.send())
    except Exception as exc:  # noqa: E722, B001
        logger.error("Failing sending nwl confirmation")
        logger.exception(exc)
    finally:
        logger.info("End send newsletter subscription confirmation")


@shared_task
def send_nwl_final(newsletter_id):
    logger.info("Send newsletter finale")
    logger.info("newsletter_id=%s", newsletter_id)
    nwl = Newsletter.objects.get(pk=newsletter_id)
    try:
        email = SibTemplateEmail(template_id=2, recipients=[{"email": nwl.email}])
        logger.info(email.send())
    except Exception as exc:  # noqa: E722, B001
        logger.error("Failing sending nwl final")
        logger.exception(exc)
    finally:
        logger.info("End send newsletter subscription confirmation")


@shared_task
def update_alive_timestamp(queue_name):
    AliveTimeStamp.objects.create(queue_name=queue_name)
