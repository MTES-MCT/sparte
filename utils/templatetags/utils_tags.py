from django import template
from django.conf import settings

register = template.Library()


@register.inclusion_tag("utils/matomo_code.html", takes_context=True)
def tracking_code(context):
    return {
        "CSP_NONCE": context["CSP_NONCE"],
        "MATOMO_ACTIVATE": settings.MATOMO_ACTIVATE,
        "DEBUG": settings.DEBUG,
    }


@register.inclusion_tag("utils/google_tag_adwords.html", takes_context=True)
def adwords_google_tag_code(context):
    return {
        "CSP_NONCE": context["CSP_NONCE"],
        "GOOGLE_ADWORDS_ACTIVATE": settings.GOOGLE_ADWORDS_ACTIVATE,
    }


@register.inclusion_tag("utils/crisp_tag.html", takes_context=True)
def crisp_tag_code(context):
    return {
        "CSP_NONCE": context["CSP_NONCE"],
        "CRISP_WEBSITE_ID": settings.CRISP_WEBSITE_ID,
        "CRISP_ACTIVATED": settings.CRISP_ACTIVATED,
    }
