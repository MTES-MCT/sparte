from django import template

register = template.Library()


@register.inclusion_tag("highcharts/translation.html")
def translate_chart():
    return dict()
