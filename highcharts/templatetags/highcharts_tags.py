from django import template


register = template.Library()


@register.inclusion_tag("highcharts/french_translation.html")
def french_translation():
    return dict()


@register.inclusion_tag("highcharts/display_chart.html")
def display_chart(div_id, chart):
    context = {
        "div_id": div_id,
        "js_name": "noname",
    }
    if chart:
        context.update(
            {
                "chart_name": chart.get_name(),
                "json_options": chart.dumps(),
                "js_name": chart.get_js_name(),
            }
        )
    return context
