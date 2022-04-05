from colour import Color, RGB_TO_COLOR_NAMES
from random import choice


ALL_COLORS = [_ for t in RGB_TO_COLOR_NAMES.items() for _ in t[1]]


def is_valid(color_name):
    """Check that the color name is a known color in colour library"""
    return color_name in ALL_COLORS


def get_random_color():
    """Return a color name randomly"""
    return choice(ALL_COLORS)  # nosec - no security use of this color


def get_color_gradient(color_name="Blue", scale=10):
    """
    Return a list of a color's gradient
    Example:
    > get_color_gradient(color_name="orange", scale=9)
    [<Color orange>, <Color #ffaf1d>, <Color #ffba39>, <Color #ffc456>,
    <Color #ffce72>, <Color #ffd88f>, <Color #ffe2ac>, <Color #ffecc8>,
    <Color #fff6e5>]

    Args:
        color_name=None (undefined): name available in colour.Colour
        scale=9 (undefined): number of colors require to fill the gradien
    """
    c1 = Color(color_name)
    c2 = Color(c1.web)
    c2.set_luminance(0.95)
    return list(c1.range_to(c2, scale))
