from django import template
from django.conf import settings


register = template.Library()


@register.inclusion_tag("utils/matomo_code.html", takes_context=True)
def tracking_code(context):
    return {
        "CSP_NONCE": context["CSP_NONCE"],
        "DISPLAY": settings.MATOMO_ACTIVATE,
    }
