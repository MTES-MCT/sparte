from django.test import TestCase

from users.models import User
from utils.validators import MISSING_SPECIAL_CHAR_ERROR

valid_payload = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@gmail.com",
    "password1": "ycvqB:U7aj%umbG3H<f8@D",
    "password2": "ycvqB:U7aj%umbG3H<f8@D",
    "accept_privacy": True,
}

form_url = "/users/signup/"
success_url = "/users/signin/"


class SignupTest(TestCase):
    fixtures = ["users/tests/parameters.json"]

    def test_signup_form_with_working_payload(self) -> None:
        response = self.client.post(path=form_url, data=valid_payload)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, success_url)
        self.assertTrue(User.objects.filter(email=valid_payload["email"]).exists())

    def test_signup_form_with_html_in_payload(self) -> None:
        fields_to_test = {
            "first_name": "<h1>John</h1>",
            "last_name": "<h1>Doe</h1>",
        }

        for field, value in fields_to_test.items():
            with self.subTest(field=field):
                data = {**valid_payload, field: value}
                response = self.client.post(path=form_url, data=data)
                self.assertFormError(
                    response=response,
                    form="form",
                    field=field,
                    errors="Le champ ne doit contenir que des lettres, des espaces ou des tirets.",
                )

    def test_signup_form_with_invalid_email(self) -> None:
        data = {**valid_payload, "email": "john.doe"}
        response = self.client.post(path=form_url, data=data)
        self.assertFormError(
            response=response,
            form="form",
            field="email",
            errors="Saisissez une adresse e-mail valide.",
        )

    def test_signup_form_with_different_passwords(self) -> None:
        data = {**valid_payload, "password2": "password2"}
        response = self.client.post(path=form_url, data=data)
        self.assertFormError(
            response=response,
            form="form",
            field="password2",
            errors="Les mots de passe ne sont pas identiques",
        )

    def test_allowed_characters_are_accepted(self) -> None:
        fields_to_test = {
            "first_name": "John-Doe",
            "last_name": "John Do'e",
        }

        data = {**valid_payload, **fields_to_test}
        response = self.client.post(path=form_url, data=data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, success_url)
        self.assertTrue(User.objects.filter(email=valid_payload["email"]).exists())

    def test_accents_are_accepted(self):
        data = {**valid_payload, **{"first_name": "Jérôme"}}
        response = self.client.post(path=form_url, data=data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, success_url)
        self.assertTrue(User.objects.filter(email=valid_payload["email"]).exists())

    def test_strong_password_are_accepted(self):
        strong_password = "ycvqB:U7aj%umbG3H<f8@D"
        data = {**valid_payload, **{"password1": strong_password, "password2": strong_password}}
        response = self.client.post(path=form_url, data=data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, success_url)
        self.assertTrue(User.objects.filter(email=valid_payload["email"]).exists())

    def test_password_do_not_contain_common_password(self):
        password_payload = {
            "password1": "password!",
            "password2": "password!",
        }

        data = {**valid_payload, **password_payload}
        response = self.client.post(path=form_url, data=data)

        self.assertFormError(
            response=response,
            form="form",
            field="password1",
            errors="Ce mot de passe est trop courant.",
        )

    def test_password_minimum_length(self):
        password_payload = {
            "password1": "pass!",
            "password2": "pass!",
        }

        data = {**valid_payload, **password_payload}
        response = self.client.post(path=form_url, data=data)
        self.assertFormError(
            response=response,
            form="form",
            field="password1",
            errors="Ce mot de passe est trop court. Il doit contenir au minimum 8 caractères.",
        )

    def test_password_contains_special_chars(self):
        password_payload = {
            "password1": "verystrongpassbutwithoutspecialchar1432",
            "password2": "verystrongpassbutwithoutspecialchar1432",
        }

        data = {**valid_payload, **password_payload}
        response = self.client.post(path=form_url, data=data)
        self.assertFormError(
            response=response,
            form="form",
            field="password1",
            errors=MISSING_SPECIAL_CHAR_ERROR,
        )
