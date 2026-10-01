from django.test import TestCase

from oidc.backends import ProConnectAuthenticationBackend
from users.models import User

claims = {
    "email": "agent@beta.gouv.fr",
    "given_name": "Jane",
    "usual_name": "Doe",
    "siret": "13002526500013",
}


class ProConnectUpdateUserTest(TestCase):
    def setUp(self):
        self.backend = ProConnectAuthenticationBackend()

    def test_password_becomes_unusable_on_proconnect_login(self) -> None:
        user = User.objects.create_user(
            first_name="John", last_name="Doe", email=claims["email"], password="ycvqB:U7aj%umbG3H<f8@D"
        )
        self.backend.update_user(user, claims)
        user.refresh_from_db()
        self.assertFalse(user.has_usable_password())
        self.assertTrue(user.proconnect)

    def test_unusable_password_is_not_regenerated(self) -> None:
        user = User.objects.create_user(first_name="John", last_name="Doe", email=claims["email"], proconnect=True)
        password = user.password
        self.backend.update_user(user, claims)
        user.refresh_from_db()
        self.assertEqual(user.password, password)
