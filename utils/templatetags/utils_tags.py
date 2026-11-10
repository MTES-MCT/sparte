from django import template
from django.conf import settings

from utils.antispam import generate_token

register = template.Library()


@register.simple_tag
def antispam_token():
    return generate_token()


@register.inclusion_tag("utils/matomo_code.html", takes_context=True)
def tracking_code(context):
    return {
        "CSP_NONCE": context["CSP_NONCE"],
        "MATOMO_ACTIVATE": settings.MATOMO_ACTIVATE,
        "MATOMO_SRC": settings.MATOMO_SRC,
        "MATOMO_SITE_ID": settings.MATOMO_SITE_ID,
        "DEBUG": settings.DEBUG,
        "REQUEST": context.get("request"),
        "ENVIRONMENT": settings.ENVIRONMENT,
    }


@register.inclusion_tag("utils/crisp_tag.html", takes_context=True)
def crisp_tag_code(context):
    return {
        "CSP_NONCE": context["CSP_NONCE"],
        "CRISP_WEBSITE_ID": settings.CRISP_WEBSITE_ID,
        "CRISP_ACTIVATED": settings.CRISP_ACTIVATED,
    }


@register.inclusion_tag("utils/messages_widget.html", takes_context=True)
def messages_widget_code(context):
    return {
        "CSP_NONCE": context["CSP_NONCE"],
        "MESSAGES_WIDGET_ACTIVATED": settings.MESSAGES_WIDGET_ACTIVATED,
        "MESSAGES_WIDGET_API": settings.MESSAGES_WIDGET_API,
        "MESSAGES_WIDGET_CHANNEL": settings.MESSAGES_WIDGET_CHANNEL,
        "MESSAGES_WIDGET_LOADER_SRC": settings.MESSAGES_WIDGET_LOADER_SRC,
        "MESSAGES_WIDGET_SCRIPT_SRC": settings.MESSAGES_WIDGET_SCRIPT_SRC,
    }
