from random import choice

from colour import RGB_TO_COLOR_NAMES, Color

ALL_COLORS = [_ for t in RGB_TO_COLOR_NAMES.items() for _ in t[1]]


def is_valid(color_name):
    """Check that the color name is a known color in colour library"""
    return color_name in ALL_COLORS


def get_random_color():
    """Return a color name randomly"""
    return choice(ALL_COLORS)  # nosec


def get_2_colors_gradient(c1, c2, scale):
    if scale == 1:
        return [c1]
    progression = zip(
        [i / (scale - 1) for i in range(scale)],
        [i / (scale - 1) for i in range(scale - 1, -1, -1)],
    )
    return [
        Color(
            red=c1.red * q + c2.red * p,
            green=c1.green * q + c2.green * p,
            blue=c1.blue * q + c2.blue * p,
        )
        for p, q in progression
    ]


def get_onecolor_gradient(c1, scale):
    """
    Return a list of a color's gradient
    Example:
    > get_onecolor_gradient(Color("orange"), 9)
    [<Color orange>, <Color #ffaf1d>, <Color #ffba39>, <Color #ffc456>,
    <Color #ffce72>, <Color #ffd88f>, <Color #ffe2ac>, <Color #ffecc8>,
    <Color #fff6e5>]

    Args:
        color_name=None (undefined): name available in colour.Colour
        scale=9 (undefined): number of colors require to fill the gradien
    """
    c2 = Color(c1.web)
    c2.set_luminance(0.95)
    return get_2_colors_gradient(c1, c2, scale)


def get_intervals(scale, nb_colors):
    intervals = []
    nb_cubes = scale - nb_colors
    cpt = 0
    while nb_cubes > 0:
        cpt += 1
        pad = nb_cubes // (nb_colors - cpt)
        nb_cubes -= pad
        intervals.append(pad)
    return intervals


def get_multicolors_gradient(colors=None, scale=9):
    if colors is None:
        raise ValueError("colors args can't be null")
    if len(colors) >= scale:
        raise ValueError("You need to provide scale+1 different colors")
    intervals = get_intervals(scale, len(colors))
    results = list()
    for i, pad in enumerate(intervals):
        results += get_2_colors_gradient(colors[i], colors[i + 1], pad + 2)[:-1]
    results.append(colors[-1])
    return results


def get_yellow2red_gradient(scale):
    return get_2_colors_gradient(Color("Cornsilk"), Color("Crimson"), scale)


def get_green2red_gradient(scale):
    colors = [
        Color("ForestGreen"),
        Color("Cornsilk"),
        Color("Crimson"),
    ]
    return get_multicolors_gradient(colors=colors, scale=scale)


def get_blue_gradient(scale):
    return get_onecolor_gradient(Color("blue"), scale)


def get_dark_blue_gradient(scale):
    colors = [Color(h) for h in ("#eff3ff", "#6baed6", "#084594")]
    return get_multicolors_gradient(colors=colors, scale=scale)
