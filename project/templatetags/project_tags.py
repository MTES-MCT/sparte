from django.template import Library
from django.utils.safestring import mark_safe


register = Library()


@register.filter
def td(items, arg=""):
    """Encapsulate items in <td></td> tag."""
    if not isinstance(items, type([])):
        items = [items]
    if arg == "%":
        items = [f"{i:.2%}" for i in items]
    return mark_safe("".join(f"<td>{item}</td>" for item in items))  # nosec
