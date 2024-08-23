from django import template

register = template.Library()


@register.inclusion_tag("highcharts/french_translation.html", takes_context=True)
def french_translation(context):
    return {
        "CSP_NONCE": context["CSP_NONCE"],
    }


@register.inclusion_tag("highcharts/display_chart.html")
def display_chart(div_id, chart, nonce):
    context = {
        "div_id": div_id,
        "js_name": "noname",
        "CSP_NONCE": nonce,
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


@register.inclusion_tag("highcharts/display_chart_data.html")
def display_chart_data(div_id, chart, nonce):
    context = {
        "div_id": div_id,
        "CSP_NONCE": nonce,
    }
    if chart:
        context.update(
            {
                "chart_name": chart.get_name(),
                "json_options": chart.dict(),
            }
        )
    return context
