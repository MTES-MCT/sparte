from urllib.parse import urlencode

from django.core import mail
from django.test import TestCase, override_settings

from config import settings
from users.models import User

testing_middleware = [m for m in settings.MIDDLEWARE if "csrf" not in m.lower()]

reset_templates = ["users/password_reset_email.txt", "users/password_reset_email.html"]
proconnect_templates = [
    "users/password_reset_proconnect_subject.txt",
    "users/password_reset_proconnect_email.txt",
    "users/password_reset_proconnect_email.html",
]


@override_settings(
    MIDDLEWARE=testing_middleware,
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
class PasswordResetTest(TestCase):
    def request_reset(self, email):
        return self.client.post(
            path="/users/password-reset/",
            data=urlencode({"email": email}),
            content_type="application/x-www-form-urlencoded",
        )

    def assert_templates_used(self, response, used, not_used):
        for template_name in used:
            self.assertTemplateUsed(response, template_name)
        for template_name in not_used:
            self.assertTemplateNotUsed(response, template_name)

    def test_user_with_password_receives_reset_link(self) -> None:
        User.objects.create_user(
            first_name="John", last_name="Doe", email="john.doe@gmail.com", password="ycvqB:U7aj%umbG3H<f8@D"
        )
        response = self.request_reset("john.doe@gmail.com")
        self.assertRedirects(response, "/users/password-reset/done/", fetch_redirect_response=False)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("/users/password-reset-confirm/", mail.outbox[0].body)
        self.assertNotIn("ProConnect", mail.outbox[0].body)
        self.assertNotIn("&#", mail.outbox[0].body)
        self.assert_templates_used(response, used=reset_templates, not_used=proconnect_templates)

    def test_proconnect_user_without_password_receives_proconnect_email(self) -> None:
        User.objects.create_user(first_name="John", last_name="Doe", email="agent@beta.gouv.fr", proconnect=True)
        response = self.request_reset("agent@beta.gouv.fr")
        self.assertRedirects(response, "/users/password-reset/done/", fetch_redirect_response=False)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("ProConnect", mail.outbox[0].subject)
        self.assertIn("/users/signin/", mail.outbox[0].body)
        self.assertNotIn("/users/password-reset-confirm/", mail.outbox[0].body)
        self.assert_templates_used(response, used=proconnect_templates, not_used=reset_templates)

    def test_proconnect_user_with_password_receives_reset_link(self) -> None:
        User.objects.create_user(
            first_name="John",
            last_name="Doe",
            email="agent@beta.gouv.fr",
            password="ycvqB:U7aj%umbG3H<f8@D",
            proconnect=True,
        )
        response = self.request_reset("agent@beta.gouv.fr")
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("/users/password-reset-confirm/", mail.outbox[0].body)
        self.assert_templates_used(response, used=reset_templates, not_used=proconnect_templates)

    def test_unknown_email_sends_nothing(self) -> None:
        response = self.request_reset("nobody@gmail.com")
        self.assertRedirects(response, "/users/password-reset/done/", fetch_redirect_response=False)
        self.assertEqual(len(mail.outbox), 0)
        self.assert_templates_used(response, used=[], not_used=reset_templates + proconnect_templates)
