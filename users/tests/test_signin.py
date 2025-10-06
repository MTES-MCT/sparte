from urllib.parse import urlencode

from django.test import TestCase, override_settings

from config import settings
from users.models import User

form_url = "/users/signin/"

testing_middleware = [m for m in settings.MIDDLEWARE if "csrf" not in m.lower()]


class SigninTest(TestCase):
    fixtures = ["users/tests/parameters.json"]

    def setUp(self):
        self.credentials = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@gmail.com",
            "password": "ycvqB:U7aj%umbG3H<f8@D",
        }
        User.objects.create_user(**self.credentials)

    @override_settings(MIDDLEWARE=testing_middleware)
    def test_signin_form_with_working_payload(self) -> None:
        self.assertTrue(User.objects.filter(email=self.credentials["email"]).exists())
        response = self.client.post(
            path="/users/signin/",
            data=urlencode(
                {
                    "username": self.credentials["email"],
                    "password": self.credentials["password"],
                }
            ),
            content_type="application/x-www-form-urlencoded",
        )
        self.assertEqual(response.wsgi_request.user.is_authenticated, True)

    @override_settings(MIDDLEWARE=testing_middleware)
    def test_signin_redirects_to_next_param(self) -> None:
        next_url = "/accessibilite"
        response = self.client.post(
            path=f"/users/signin/?next={next_url}",
            data=urlencode(
                {
                    "username": self.credentials["email"],
                    "password": self.credentials["password"],
                }
            ),
            content_type="application/x-www-form-urlencoded",
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, next_url)

    @override_settings(MIDDLEWARE=testing_middleware)
    def test_signin_does_not_redirect_to_external_next_param(self) -> None:
        next_url = "https://malicious-site.com"
        default_success_url = "/project/mes-diagnostics"
        response = self.client.post(
            path=f"/users/signin/?next={next_url}",
            data=urlencode(
                {
                    "username": self.credentials["email"],
                    "password": self.credentials["password"],
                }
            ),
            content_type="application/x-www-form-urlencoded",
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, default_success_url)
