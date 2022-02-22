from django import template

register = template.Library()


@register.inclusion_tag("utils/matomo_code.html")
def tracking_code():
    return {}
