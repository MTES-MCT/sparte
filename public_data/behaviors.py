from colour import Color, RGB_TO_COLOR_NAMES
from pathlib import Path
from random import choice
import numpy as np

from django.contrib.gis.utils import LayerMapping
from django.core.exceptions import FieldDoesNotExist
from django.db import connection


def get_color_gradient(color_name=None, scale=10):
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
    if not color_name:
        all_available_colors = [_ for t in RGB_TO_COLOR_NAMES.items() for _ in t[1]]
        color_name = choice(all_available_colors)

    c1 = Color(color_name)
    c2 = Color(c1.web)
    c2.set_luminance(0.95)
    return list(c1.range_to(c2, scale))


class AutoLoadMixin:
    """
    Enable auto loading of data into database according to
    * shape_file_path - usually shape file is in media directory
    * mapping - between feature name and database field name
    Those two needs to be set in child class.

    SeeAlso::
    - public_data.management.commands.shp2model
    - public_data.management.commands.load_data
    """

    # properties that need to be set when heritating
    shape_file_path = Path()
    mapping = dict()

    @classmethod
    def load(cls, verbose=True):
        """
        Populate table with data from shapefile

        Args:
            cls (undefined): default class calling
            verbose=True (undefined): define level of verbosity
        """
        cls.objects.all().delete()
        lm = LayerMapping(cls, cls.shape_file_path, cls.mapping)
        lm.save(strict=True, verbose=verbose)


class DataColorationMixin:
    """DataColorationMixin add class' methods:
    - get_property_percentile: return percentiles of a property's distribution
    - get_gradient: evaluate percentiles and associate a color gradient

    ..seealso::
    - https://numpy.org/doc/stable/reference/generated/numpy.percentile.html
    """

    ALL_COLORS = [_ for t in RGB_TO_COLOR_NAMES.items() for _ in t[1]]

    # DataColorationMixin properties that need to be set when heritating
    default_property = "surface"  # need to be set correctly to work
    default_color = None

    @classmethod
    def get_gradient(cls, color_name=None, property_name=None):
        # get the numeric scale
        percentiles = cls.get_percentile(property_name=property_name)

        # evaluate how many steps there is in the scale to get same number of color
        nb_colors = len(percentiles) + 1
        # hook for getting a color_name
        color_name = cls.get_color(color_name=color_name)
        # get a gradient of color
        colours = get_color_gradient(color_name=color_name, scale=nb_colors)[::-1]

        # add colors to the scale
        gradient = {
            0: colours.pop(0),
        }
        for percentile in percentiles:
            gradient[percentile] = colours.pop(0)

        return gradient

    @classmethod
    def get_color(cls, color_name=None):
        # keep color_name if one is provided else try to use default_color
        if not color_name:
            color_name = cls.default_color
        # if color is known by the lib return it
        # else a color is chosen randomly
        if color_name in cls.ALL_COLORS:
            return color_name
        else:
            return choice(cls.ALL_COLORS)

    @classmethod
    def get_property_data(cls, property_name=None):
        # UPDATE replace use of raw sql by simple django queryset
        with connection.cursor() as cursor:
            query = (
                f"SELECT {property_name} FROM {cls._meta.db_table}"
                f" ORDER BY {property_name} ASC;"
            )
            cursor.execute(query)
            rows = cursor.fetchall()
        return rows

    @classmethod
    def get_percentile(cls, property_name=None, percentiles=None):
        """
        Return decile scale of the specified property
        Deciles are the 9 values that divide  distribution in 10 equal parts

        Args:
            property_name=self.default_property: a name of a field of the model
            if not provided, uses self.default_property
            percentiles=boundaries (between 0 - 100) to compute
        """
        try:
            # will raise an exception if field does not exist or is None
            cls._meta.get_field(property_name)
        except FieldDoesNotExist:
            # Question: ne faudrait-il pas plutôt crasher
            # violement si le field n'existe pas ?
            property_name = cls.default_property

        if not percentiles:
            percentiles = range(10, 100, 10)
        rows = cls.get_property_data(property_name=property_name)
        return np.percentile(rows, percentiles, interpolation="lower")
