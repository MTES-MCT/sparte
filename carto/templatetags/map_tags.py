from django import template
from django.utils.safestring import mark_safe


register = template.Library()


@register.filter
def geolayer(layer):  # Only one argument.
    """Add a geojson layer to the leaflet map"""

    # add base info name and url
    html = [f'geo_layer = new GeoLayer("{layer["name"]}", "{layer["url"]}")']

    # add options
    # default load_full_data is true, then adding this option only if we want false
    if layer.get("load_full_data", True) is False:
        html.append("geo_layer.load_full_data = false")

    # same as previous, default behavior is false
    if layer.get("immediate_display", True) is False:
        html.append("geo_layer.immediate_display = false")

    # enable custom color setting
    if layer.get("gradien", None):
        html.append("geo_layer.get_color = (feature) => {")
        html.append(get_custom_color(layer["gradien"]))
        html.append("}")

    # close the tag by adding the layer to the map
    html.append("geo_layer.add_to_map(carto)")
    html = "\n".join(html)
    return mark_safe(html)  # nosec


def get_custom_color(gradien):
    """gradien = [(100, '#112233'), (90, '#aabbcc'), '#000022', ]"""
    html = ["    d = this.get_color_property(feature)"]
    last_color = gradien.pop()
    level, color = gradien.pop(0)
    html.append(f"    return d > {level} ? '{color}' :")
    for level, color in gradien:
        html.append(f"           d > {level} ? '{color}' :")
    html.append(f"'{last_color}'")
    return "\n".join(html)
