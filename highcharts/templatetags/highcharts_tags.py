from django import template

register = template.Library()


@register.inclusion_tag("highcharts/french_translation.html", takes_context=True)
def french_translation(context):
    return {
        "CSP_NONCE": context["CSP_NONCE"],
    }
