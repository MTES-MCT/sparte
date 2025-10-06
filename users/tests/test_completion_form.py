from urllib.parse import urlencode

from django.test import TestCase, override_settings

from config import settings
from public_data.models import AdminRef
from users.models import User

form_url = "/users/complete-profile/"

testing_middleware = [m for m in settings.MIDDLEWARE if "csrf" not in m.lower()]

working_payload = {
    "organism": User.ORGANISM.COMMUNE,
    "function": User.FUNCTION.ELU,
    "main_land_id": "12345",
    "main_land_type": AdminRef.COMMUNE,
}


class CompleteProfileTest(TestCase):
    fixtures = ["users/tests/parameters.json"]

    def setUp(self):
        self.credentials = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@gmail.com",
            "password": "ycvqB:U7aj%umbG3H<f8@D",
        }
        self.user = User.objects.create_user(**self.credentials)

    @override_settings(MIDDLEWARE=testing_middleware)
    def test_complete_profile_form_with_working_payload(self) -> None:
        self.client.force_login(self.user)
        self.assertFalse(self.user.is_profile_complete)
        response = self.client.post(
            path=form_url, data=urlencode(working_payload), content_type="application/x-www-form-urlencoded"
        )
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.wsgi_request.user.is_profile_complete)

    @override_settings(MIDDLEWARE=testing_middleware)
    def test_complete_profile_form_redirects_to_next_param(self) -> None:
        next_url = "/accessibilite"
        self.client.force_login(self.user)
        response = self.client.post(
            path=f"/users/complete-profile/?next={next_url}",
            data=urlencode(working_payload),
            content_type="application/x-www-form-urlencoded",
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, next_url)

    @override_settings(MIDDLEWARE=testing_middleware)
    def test_complete_profile_does_not_redirect_to_external_next_param(self) -> None:
        next_url = "https://malicious-site.com"
        self.client.force_login(self.user)
        response = self.client.post(
            path=f"/users/complete-profile/?next={next_url}",
            data=urlencode(working_payload),
            content_type="application/x-www-form-urlencoded",
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/")
