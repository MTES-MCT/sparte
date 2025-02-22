from decimal import Decimal

from django.template import Library

register = Library()


@register.filter
def hectar(value):
    if not isinstance(value, str):
        value = str(value)
    if not value.isdigit():
        return value
    chunks = []
    while value:
        if len(value) >= 3:
            chunks.insert(0, value[-3:])
            value = value[:-3]
        else:
            chunks.insert(0, value)
            value = None
    value = " ".join(chunks)
    return f"{value} ha"


# @register.filter
# def sq_km(value):
#     """value is a float representing a surface using square kilometers as unit
#     this tag simply format mille with space and leave only two digits in decimals"""
#     if not isinstance(value, str):
#         value = str(value)
#     try:
#         integer, decimal = value.split(".")
#     except ValueError:
#         integer = value
#         decimal = "00"
#     if not integer.isdigit() or not decimal.isdigit():
#         return value
#     chunks = []
#     while integer:
#         if len(integer) >= 3:
#             chunks.insert(0, integer[-3:])
#             integer = integer[:-3]
#         else:
#             chunks.insert(0, integer)
#             integer = None
#     integer = " ".join(chunks)
#     return f"{integer},{decimal[:2]}"


@register.filter
def remove(value, arg=0):
    return value - arg


@register.filter
def percent(value, arg=0):
    if not arg or arg < value:
        return value
    if isinstance(value, Decimal):
        value = float(value)
    if isinstance(arg, Decimal):
        arg = float(arg)
    return f"{int((value / arg) * 100)}%"


@register.filter
def space(value):
    return " ".join(["-"] * (value - 1))


@register.filter
def smart_round(value):
    """
    Arrondit à 2 décimales uniquement si la valeur comporte des décimales.
    """
    try:
        value = float(value)
        if value.is_integer():
            return int(value)  # Retourne l'entier si pas de décimales
        return round(value, 2)  # Sinon retourne avec 2 décimales
    except (ValueError, TypeError):
        return value  # Retourne la valeur brute en cas d'erreur


@register.filter
def divide_by(value, arg):
    try:
        return float(value) / float(arg)
    except (ValueError, ZeroDivisionError):
        return None
