from django import template


register = template.Library()


@register.inclusion_tag("carto/tag_geolayer.html")
def geolayer(layer):  # Only one argument.
    """Add a geojson layer to the leaflet map"""

    # Color_rul and use_emprise_style are mutualy excluding
    color_url = layer.get("gradient_url", None)
    use_emprise_style = layer.get("use_emprise_style", False)
    if color_url is not None and use_emprise_style is True:
        raise ValueError(
            "gradient_url and use_emprise_style can't be used simultaneously"
        )

    return {
        "name": layer["name"],
        "url": layer["url"],
        "color_url": color_url,
        "use_emprise_style": use_emprise_style,
    }
