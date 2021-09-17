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
def td(items, arg=""):
    """Encapsulate items in <td></td> tag."""
    if not isinstance(items, type([])):
        items = [items]
    if arg == "%":
        items = [f"{i:.2%}" for i in items]
    return mark_safe("".join(f"<td>{item}</td>" for item in items))  # nosec
