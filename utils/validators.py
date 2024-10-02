from django.core.exceptions import ValidationError


def is_alpha_valid(value: str) -> bool:
    special_chars_allowed = [" ", "-", "'"]
    return all(char.isalpha() or char in special_chars_allowed for char in value)


def is_alpha_validator(value: str) -> bool:
    if not is_alpha_valid(value):
        raise ValidationError("Le champ ne doit contenir que des lettres, des espaces ou des tirets.")
