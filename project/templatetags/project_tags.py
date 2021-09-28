from django.template import Library
from django.utils.safestring import mark_safe


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


@register.filter
def sq_km(value):
    """value is a float representing a surface using square kilometers as unit
    this tag simply format mille with space and leave only two digits in decimals"""
    if not isinstance(value, str):
        value = str(value)
    try:
        integer, decimal = value.split(".")
    except ValueError:
        integer = value
        decimal = "00"
    if not integer.isdigit() or not decimal.isdigit():
        return value
    chunks = []
    while integer:
        if len(integer) >= 3:
            chunks.insert(0, integer[-3:])
            integer = integer[:-3]
        else:
            chunks.insert(0, integer)
            integer = None
    integer = " ".join(chunks)
    return f"{integer},{decimal[:2]}"


@register.filter
def remove(value, arg=0):
    result = value - arg
    if result > 0:
        return f"+{sq_km(result)}"
    elif result < 0:
        return f"-{sq_km(abs(result))}"
    else:
        return "-"


@register.filter
def percent(value, arg=0):
    if not arg or arg < value:
        return value
    return f"{int((value / arg) * 100)}%"


@register.filter
def space(value):
    return " ".join(["-"] * (value - 1))


@register.filter
def td(items, arg=""):
    """Encapsulate items in <td></td> tag."""
    if not isinstance(items, type([])):
        items = [items]
    if arg == "%":
        items = [f"{i:.2%}" for i in items]
    return mark_safe("".join(f"<td>{item}</td>" for item in items))  # nosec
