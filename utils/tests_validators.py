from django.core.exceptions import ValidationError
from django.test import TestCase

from .validators import ContainsSpecialCharacterValidator


class TestValidators(TestCase):
    def test_contains_special_character_validator_with_invalid_password(self) -> None:
        validator = ContainsSpecialCharacterValidator()
        with self.assertRaises(ValidationError):
            validator.validate(password="password")
