from string import punctuation

from django.core.exceptions import ValidationError

NOT_ALPHA_ERROR = "Le champ ne doit contenir que des lettres, des espaces ou des tirets."
MISSING_SPECIAL_CHAR_ERROR = "Le mot de passe doit contenir au moins un caractère spécial."


def is_alpha_valid(value: str) -> bool:
    special_chars_allowed = [" ", "-", "'"]
    return all(char.isalpha() or char in special_chars_allowed for char in value)


def is_alpha_validator(value: str) -> bool:
    if not is_alpha_valid(value):
        raise ValidationError(NOT_ALPHA_ERROR)


class ContainsSpecialCharacterValidator:
    def validate(self, password, user=None):
        if not any(char in password for char in punctuation):
            raise ValidationError(MISSING_SPECIAL_CHAR_ERROR)

    def get_help_text(self):
        return MISSING_SPECIAL_CHAR_ERROR
