from django import template


register = template.Library()


@register.inclusion_tag("carto/tag_geolayer.html")
def geolayer(layer):  # Only one argument.
    """Add a geojson layer to the leaflet map"""

    return {
        "name": layer["name"],
        "url": layer["url"],
        "color_url": layer.get("gradient_url", None),
    }
