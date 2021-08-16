import logging

from django.contrib.gis.gdal import DataSource

# from django.contrib.gis.utils import LayerMapping
from django.core.management.base import BaseCommand, CommandError

from pathlib import Path


logging.basicConfig(level=logging.INFO)


def to_camel_case(text):
    """Turns a text (without spaces) to CamelCase style."""
    items = str(text).split("_")
    capitalized_items = (ele.title() for ele in items)
    return "".join(capitalized_items)


def get_django_type(oft_type):
    transco = {
        "OFTString": "CharField",
        "OFTInteger": "IntegerField",
        "OFTReal": "FloatField",
        "OFTInteger64": "IntegerField",
    }
    try:
        return transco[oft_type.__name__]
    except KeyError:
        raise Exception(f"Unknow OFT type: {oft_type}")


# def get_max_length(layer, field_index):
#     """Loop on all feature and get the max len of all the values."""
#     max_len = 0
#     field_name = layer.fields[field_index]

#     # loop on all the features
#     for feat in layer:
#         field_value = feat.get(field_name)
#         if max_len < len(field_value):
#             max_len = len(field_value)

#     return max_len


class Command(BaseCommand):
    help = "Given a path to a shape file this infer a GeoDjango model"

    def add_arguments(self, parser):
        parser.add_argument("shape_path", type=Path, help="Path to shape file")

    def open_shape_file(self, path):
        # switch to absolute path
        path = path.resolve()
        if path.is_file():
            if path.suffix == ".shp":
                return DataSource(path)
            else:
                raise CommandError("Given file doesn't have correct extension (.shp)")
        else:
            raise CommandError("Given path is not a file")

    def handle(self, *args, **options):
        logging.info("Analyse shape file to infer GeoDjango Model")

        path = options["shape_path"]
        logging.info("Given file: %s", path)
        datasource = self.open_shape_file(path)

        layer = datasource[0]

        class_name = to_camel_case(layer)
        print(f"class {class_name}(AutoLoad):")

        mapping = dict()
        for i, field_name in enumerate(layer.fields):
            field_type = get_django_type(layer.field_types[i])
            mapping[field_name] = field_name.lower()
            print(
                " " * 3,
                '{0} = models.{1}(_("{0}"), max_length={2})'.format(
                    field_name.lower(), field_type, layer.field_widths[i]
                ),
            )
        print("")
        print(" " * 3, "mpoly = models.MultiPolygonField()")
        print("")
        print(" " * 3, f'shape_file_path = Path("{path}")')
        print(" " * 3, "mapping = {")
        for key, value in mapping.items():
            print(" " * 7, f'"{value}": "{key}",')
        print(" " * 7, '"mpoly": "MULTIPOLYGON",')
        print(" " * 3, "}")
