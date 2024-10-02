from django.test import TestCase

valid_payload = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@gmail.com",
    "organism": "Test",
    "function": "Test",
    "password1": "password",
    "password2": "password",
}

form_url = "/users/signup/"


class SignupTest(TestCase):
    fixtures = ["users/tests/parameters.json"]

    def test_signup_form_with_working_payload(self) -> None:
        response = self.client.post(path=form_url, data=valid_payload)
        self.assertFormError(
            response=response,
            form="form",
            field=None,
            errors=[],
        )

    def test_signup_form_with_html_in_payload(self) -> None:
        fields_to_test = {
            "first_name": "<h1>John</h1>",
            "last_name": "<h1>Doe</h1>",
            "function": "<h1>Test</h1>",
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
            "function": "Test",
        }

        data = {**valid_payload, **fields_to_test}

        response = self.client.post(path=form_url, data=data)
        self.assertFormError(
            response=response,
            form="form",
            field=None,
            errors=[],
        )

    def test_accents_are_accepted(self):
        data = {**valid_payload, **{"first_name": "Jérôme"}}
        response = self.client.post(path=form_url, data=data)
        self.assertFormError(
            response=response,
            form="form",
            field=None,
            errors=[],
        )
