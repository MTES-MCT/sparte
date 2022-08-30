from celery import shared_task
import logging
from django_app_parameter import app_parameter

from utils.emails import send_template_email

from .models import ContactForm, Newsletter


logger = logging.getLogger(__name__)


@shared_task
def send_contact_form(contact_form_id):
    logger.info("Send contact email to bilan SPARTE team")
    logger.info("contact_email_id=%s", contact_form_id)
    contact_form = ContactForm.objects.get(pk=contact_form_id)
    try:
        send_template_email(
            subject=f"Formulaire de contact - {contact_form.email}",
            recipients=[app_parameter.TEAM_EMAIL],
            template_name="home/emails/contact_form",
            context={
                "content": contact_form.content,
                "content_html": contact_form.content.replace("\n", "<br/>"),
            },
        )
        contact_form.success()
    except:  # noqa: E722, B001
        logger.error("Failing sending email")
        contact_form.handle_exception()
    finally:
        logger.info("End send contact email to bilan SPARTE team")


@shared_task
def send_nwl_confirmation(newsletter_id):
    logger.info("Send newsletter subscription confirmation request")
    logger.info("newsletter_id=%s", newsletter_id)
    nwl = Newsletter.objects.get(pk=newsletter_id)
    try:
        send_template_email(
            subject="Confirmez votre inscription à la newsletter de SPARTE",
            recipients=[nwl.email],
            template_name="home/emails/nwl_confirmation",
            context={"url": nwl.get_confirmation_url()},
        )
    except:  # noqa: E722, B001
        logger.error("Failing sending nwl confirmation")
    finally:
        logger.info("End send newsletter subscription confirmation")


@shared_task
def send_nwl_final(newsletter_id):
    logger.info("Send newsletter finale")
    logger.info("newsletter_id=%s", newsletter_id)
    nwl = Newsletter.objects.get(pk=newsletter_id)
    try:
        send_template_email(
            subject="Vous êtes inscrit à la newsletter de SPARTE",
            recipients=[nwl.email],
            template_name="home/emails/nwl_finale",
        )
    except:  # noqa: E722, B001
        logger.error("Failing sending nwl confirmation")
    finally:
        logger.info("End send newsletter subscription confirmation")
