from django.core.exceptions import ValidationError


def is_alpha_valid(value: str) -> bool:
    return all(char.isalpha() or char == " " or char == "-" for char in value)


def is_alpha_validator(value: str) -> bool:
    if not is_alpha_valid(value):
        raise ValidationError("Le champ ne doit contenir que des lettres, des espaces ou des tirets.")
