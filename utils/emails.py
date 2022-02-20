import logging

from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template

from app_parameter.models import Parameter


logger = logging.getLogger(__name__)


def send_template_email(
    subject, recipients, template_name, context=None, expeditor=None
):
    """Send en e-mail based on templates

    Parameters:
    ==========
    * subject : subject of the e-mail, should be a short sentence
    * recipients : a list of e-mail (e-mail's to)
    * template_name : the function use two templates which should have the same name
    but two extensions : .html and .txt
    * context : should contains the data to populate templates (if any)
    * expeditor : a parameter name containing the from e-mail

    If no expeditor is provided, TEAM_EMAIL parameter is used.
    """
    logger.info("Send email based on templates")
    if not expeditor:
        expeditor = "TEAM_EMAIL"
    from_email = Parameter.objects.str(expeditor)
    text = get_template(f"{template_name}.txt")
    html = get_template(f"{template_name}.html")
    text_content = text.render(context)
    html_content = html.render(context)
    # création de l'e-mail
    msg = EmailMultiAlternatives(subject, text_content, from_email, recipients)
    msg.attach_alternative(html_content, "text/html")
    # envoi
    try:
        msg.send()
        logger.info("Email sent with success")
    except Exception as error:
        logger.error("Error while sending email, error: %s", error)
