from django.test import TestCase

from .models import CrispWebhookNotification
from .signals import format_message


class TestCrispNotification(TestCase):
    def setUp(self) -> None:
        self.maxDiff = None
        self.notification = CrispWebhookNotification(
            event="message:send",
            timestamp="2021-08-03T14:00:00Z",
            data={
                "from": "user",
                "type": "text",
                "user": {"user_id": "session_306c0770-46f3-4c66-8931-35cb324a0b72", "nickname": "Marie-José"},
                "origin": "urn:crisp.im:contact-form:0",
                "content": "**Rapport Varennes-Jarcy**\n\nBonjour,\r\ndemande effectuée à plusieurs reprises mais aucune réception,\r\nbien cordialement,",  # noqa : E501
                "stamped": True,
                "mentions": [],
                "timestamp": 1715864068597,
                "session_id": "session_306c0770-46f3-4c66-8931-35cb324a0b72",
                "website_id": "0ac14c43-849c-4fc4-8e09-923b78e9a0de",
                "fingerprint": 171586406859730,
            },
        )

    def test_sender_name(self):
        self.assertEqual(self.notification.sender_name, "Marie-José")

    def test_message(self):
        self.assertEqual(
            self.notification.message,
            """**Rapport Varennes-Jarcy**

Bonjour,
demande effectuée à plusieurs reprises mais aucune réception,
bien cordialement,""",
        )

    def test_format_message(self):
        output = format_message(self.notification)
        expected_output = """Date : 2021-08-03T14:00:00Z
Lien Crisp : https://app.crisp.chat/website/0ac14c43-849c-4fc4-8e09-923b78e9a0de/inbox/session_306c0770-46f3-4c66-8931-35cb324a0b72/
Nom : Marie-José
Message : **Rapport Varennes-Jarcy**

Bonjour,
demande effectuée à plusieurs reprises mais aucune réception,
bien cordialement,"""  # noqa : E501
        self.assertEqual(output, expected_output)
