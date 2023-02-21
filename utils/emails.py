import logging
from optparse import Option

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django_app_parameter import app_parameter
from requests import post, exceptions

import sib_api_v3_sdk as sib  # type: ignore
from sib_api_v3_sdk.rest import ApiException  # type: ignore
from typing import Any, Dict, List, Literal, Optional


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
    * expeditor : sender email address

    If no expeditor is provided, TEAM_EMAIL parameter is used.
    """
    if settings.EMAIL_ENGINE == "sendinblue":
        SendInBlueEmail.throw(
            subject=subject,
            recipients=recipients,
            template_name=template_name,
            context=context,
            expeditor=expeditor,
        )
    else:
        Email.throw(
            subject=subject,
            recipients=recipients,
            template_name=template_name,
            context=context,
            expeditor=expeditor,
        )


def prep_email(subject, recipients, template_name, context=None, expeditor=None):
    from_email = expeditor if expeditor else app_parameter.TEAM_EMAIL
    text = get_template(f"{template_name}.txt")
    html = get_template(f"{template_name}.html")
    if context is None:
        context = dict()
    context.update(
        {
            "phone_contact": app_parameter.PHONE_CONTACT,
            "email_contact": app_parameter.TEAM_EMAIL,
            "sparte_url": settings.DOMAIN_URL,
        }
    )
    text_content = text.render(context)
    html_content = html.render(context)
    # création de l'e-mail
    msg = EmailMultiAlternatives(subject, text_content, from_email, recipients)
    msg.attach_alternative(html_content, "text/html")
    return msg


class LocalLockMixin:
    def get_text_content(self):
        return (
            f"Send email with template id = {self.template_id}\n\n"
            "Parameters:\n"
            "\n".join([f"{k}={v}" for k, v in self.params.items()])
        )

    def send(self):
        if settings.EMAIL_ENGINE == "sendinblue":
            return super().send()
        msg = EmailMultiAlternatives(
            self.subject, self.get_text_content(), "no sender", [_["email"] for _ in self.recipients]
        )
        msg.send()

class Email:
    def __init__(
        self,
        subject: str = "",
        recipients=None,
        template_name="",
        context=None,
        expeditor=None,
    ):  # pylint: disable=R0913
        self.recipients = recipients
        self.sender = expeditor or app_parameter.TEAM_EMAIL
        self.subject = subject
        self.template_name = template_name
        self.context = context or {}
        self.html = get_template(f"{self.template_name}.html").render(self.context)
        self.text = get_template(f"{self.template_name}.txt").render(self.context)

    def send(self):
        logger.info("Send classical email based on templates")
        msg = EmailMultiAlternatives(
            self.subject, self.text, self.sender, self.recipients
        )
        msg.attach_alternative(self.html, "text/html")
        msg.send()

    @classmethod
    def throw(
        cls,
        subject: str = "",
        recipients=None,
        template_name="",
        context=None,
        expeditor=None,
    ) -> "Email":
        email = cls(
            subject=subject,
            recipients=recipients,
            template_name=template_name,
            context=context,
            expeditor=expeditor,
        )
        email.send()
        return email


class SendInBlueEmail(Email):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        configuration = sib.Configuration()
        configuration.api_key["api-key"] = settings.SENDINBLUE_API_KEY
        self.api_instance = sib.TransactionalEmailsApi(sib.ApiClient(configuration))
        self.sender = {"name": "Alfred", "email": self.sender}

    def send(self):
        logger.info("Send SIB email based on templates")
        email = sib.SendSmtpEmail(
            to=self.recipients,
            reply_to=self.sender,
            html_content=self.html,
            text_content=self.text,
            sender=self.sender,
            subject=self.subject,
        )
        try:
            api_response = self.api_instance.send_transac_email(email)
            logger.debug(api_response)
        except ApiException as exc:
            logger.error(f"Exception when sending SendInBlue email: {exc}")
            logger.exception(exc)
            raise exc


class SendInBlueSMS:  # pylint: disable=R0903
    def __init__(self, recipient="", content="") -> None:
        self.recipient = recipient
        self.content = content
        if not self.recipient or not self.content:
            raise ValueError("recipient and content must not be empty")
        configuration = sib.Configuration()
        configuration.api_key["api-key"] = settings.SENDINBLUE_API_KEY
        self.api_instance = sib.TransactionalSMSApi(sib.ApiClient(configuration))

    def send(self) -> None:
        sms = sib.SendTransacSms(
            type="transactional",
            sender="MyProxiteam",
            recipient=self.recipient,
            content=self.content,
        )
        try:
            api_response = self.api_instance.send_transac_sms(sms)
            logger.debug(api_response)
        except ApiException as exc:
            logger.error(f"Exception when sending SendInBlue SMS: {exc}")
            logger.exception(exc)
            raise exc


class SibTemplateEmail(LocalLockMixin):
    expected_params: List[str] = []

    def __init__(
        self,
        template_id: int,
        subject: str,
        recipients: Optional[List[Dict[Literal["email", "name"], str]]] = None,
        params: Optional[Dict[str, Any]] = None,
        attachements: Optional[List[Dict[Literal["url", "name", "content"], str]]] = None,
    ):
        self.url = "https://api.sendinblue.com/v3/smtp/email"
        self.template_id = template_id
        self.subject = subject
        self.recipients = recipients or []
        self.params = params or {}
        self.attachments = attachements or {}

    def get_params(self) -> Dict[str, str]:
        if self.expected_params:
            return {name: self.params[name] for name in self.expected_params}
        else:
            return self.params

    def get_payload(self) -> Dict[str, Any]:
        payload = {
            "templateId": self.template_id,
            "subject": self.subject,
            "to": self.recipients,
            "params": self.get_params(),
        }
        return payload

    def get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "api-key": settings.SENDINBLUE_API_KEY,
        }
        return headers

    def send(self) -> Dict:
        response = post(
            url=self.url,
            json=self.get_payload(),
            headers=self.get_headers(),
        )
        try:
            response.raise_for_status()
            return response.json()
        except exceptions.HTTPError as exc:
            logger.error(f"Exception when sending SendInBlue email: {exc}")
            logger.error(response.text)
            logger.exception(exc)
            raise exc
