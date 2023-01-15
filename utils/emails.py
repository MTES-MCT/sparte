import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from requests import post, exceptions

from typing import Any, Dict, List, Literal, Optional

logger = logging.getLogger(__name__)


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


class SibTemplateEmail(LocalLockMixin):
    expected_params: List[str] = []

    def __init__(
        self,
        template_id: int,
        subject: Optional[str] = None,
        recipients: Optional[List[Dict[Literal["email", "name"], str]]] = None,
        params: Optional[Dict[str, Any]] = None,
        attachements: Optional[List[Dict[Literal["url", "name", "content"], str]]] = None,
    ):
        self.url = "https://api.sendinblue.com/v3/smtp/email"
        self.template_id = template_id
        self.subject = subject
        self.recipients = recipients or []
        self.params = params or {}
        self.attachments = attachements or []

    def get_params(self) -> Dict[str, str]:
        if self.expected_params:
            return {name: self.params[name] for name in self.expected_params}
        else:
            return self.params

    def get_payload(self) -> Dict[str, Any]:
        payload = {
            "templateId": self.template_id,
            "to": self.recipients
        }
        if self.params:
            payload["params"] = self.get_params()
        if self.subject:
            payload["subject"] = self.subject
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
