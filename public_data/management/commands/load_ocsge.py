import json
import logging
from enum import StrEnum
from functools import cache
from typing import List, Self

from django.contrib.gis.db.models.functions import Area, Transform
from django.core.management.base import BaseCommand
from django.db.models import DecimalField
from django.db.models.functions import Cast

from public_data.models import (
    CouvertureUsageMatrix,
    Departement,
    Ocsge,
    OcsgeDiff,
    ZoneConstruite,
)
from public_data.models.mixins import AutoLoadMixin

logger = logging.getLogger("management.commands")

CONFIG_PATH = "public_data/management/commands/config_load_ocsge.json"


def get_departement(name: str) -> Departement:
    return Departement.objects.get(name=name)


@cache
def get_matrix():
    return CouvertureUsageMatrix.matrix_dict()


class AutoOcsgeDiff(AutoLoadMixin, OcsgeDiff):
    class Meta:
        proxy = True

    @classmethod
    @property
    def mapping(cls) -> dict[str, str]:
        return {
            "cs_old": f"CS_{cls._year_old}",
            "us_old": f"US_{cls._year_old}",
            "cs_new": f"CS_{cls._year_new}",
            "us_new": f"US_{cls._year_new}",
            "mpoly": "MULTIPOLYGON",
        }

    def before_save(self) -> None:
        self.year_new = self.__class__._year_new
        self.year_old = self.__class__._year_old
        self.departement = self.__class__._departement

        self.new_matrix = get_matrix()[(self.cs_new, self.us_new)]
        self.new_is_artif = bool(self.new_matrix.is_artificial)

        if self.new_matrix.couverture:
            self.cs_new_label = self.new_matrix.couverture.label

        if self.new_matrix.usage:
            self.us_new_label = self.new_matrix.usage.label

        self.old_matrix = get_matrix()[(self.cs_old, self.us_old)]
        self.old_is_artif = bool(self.old_matrix.is_artificial)

        if self.old_matrix.couverture:
            self.cs_old_label = self.old_matrix.couverture.label
        if self.old_matrix.usage:
            self.us_old_label = self.old_matrix.usage.label

        self.is_new_artif = not self.old_is_artif and self.new_is_artif
        self.is_new_natural = self.old_is_artif and not self.new_is_artif

    @classmethod
    def calculate_fields(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year_new=cls._year_new,
            year_old=cls._year_old,
        ).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )

    @classmethod
    def clean_data(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year_new=cls._year_new,
            year_old=cls._year_old,
        ).delete()


class AutoOcsge(AutoLoadMixin, Ocsge):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "couverture": "CODE_CS",
        "usage": "CODE_US",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs) -> Self:
        self.year = self.__class__._year
        self.departement = self.__class__._departement
        key = (self.couverture, self.usage)

        self.matrix = get_matrix()[key]
        self.is_artificial = bool(self.matrix.is_artificial)

        if self.matrix.couverture:
            self.couverture_label = self.matrix.couverture.label
        if self.matrix.usage:
            self.usage_label = self.matrix.usage.label

        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).delete()

    @classmethod
    def calculate_fields(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).update(
            surface=Cast(
                Area(Transform("mpoly", 2154)),
                DecimalField(max_digits=15, decimal_places=4),
            )
        )


class AutoZoneConstruite(AutoLoadMixin, ZoneConstruite):
    class Meta:
        proxy = True

    mapping = {
        "id_source": "ID",
        "millesime": "MILLESIME",
        "mpoly": "MULTIPOLYGON",
    }

    def save(self, *args, **kwargs) -> Self:
        self.year = int(self._year)
        self.surface = self.mpoly.transform(2154, clone=True).area
        self.departement = self._departement
        return super().save(*args, **kwargs)

    @classmethod
    def clean_data(cls) -> None:
        cls.objects.filter(
            departement=cls._departement,
            year=cls._year,
        ).delete()


class LayerType(StrEnum):
    OCSGE = "Ocsge"
    ZONE_CONSTRUITE = "ZoneConstruite"
    DIFF = "Diff"


class Layer:
    shape_file_path: str
    departement: Departement
    type: LayerType
    mapping: dict[str, str] | None = None
    year: int | None = None
    year_old: int | None = None
    year_new: int | None = None

    def __init__(
        self,
        shape_file_path: str,
        departement: Departement,
        type: LayerType,
        mapping: dict[str, str] | None = None,
        year: int | None = None,
        year_old: int | None = None,
        year_new: int | None = None,
    ) -> None:
        self.shape_file_path = shape_file_path
        self.departement = departement
        self.type = type
        self.mapping = mapping
        self.year = year
        self.year_old = year_old
        self.year_new = year_new

        if self.type == LayerType.DIFF:
            if not self.year_old or not self.year_new:
                raise ValueError("year_old and year_new are required for diff layer")
        elif self.type == LayerType.OCSGE or self.type == LayerType.ZONE_CONSTRUITE:
            if not self.year:
                raise ValueError("year is required for ocsge and zone_construite layer")

    @property
    def class_name(self) -> str:
        departement_ascii = self.departement.name.encode("utf-8").decode()

        if self.type == LayerType.DIFF:
            return f"{departement_ascii}Diff{self.year_old}{self.year_new}"
        elif self.type == LayerType.OCSGE:
            return f"{departement_ascii}Ocsge{self.year}"
        elif self.type == LayerType.ZONE_CONSTRUITE:
            return f"{departement_ascii}ZoneConstruite{self.year}"

    def get_related_autoload_base_class(self) -> type:
        if self.type == LayerType.DIFF:
            return AutoOcsgeDiff
        elif self.type == LayerType.OCSGE:
            return AutoOcsge
        elif self.type == LayerType.ZONE_CONSTRUITE:
            return AutoZoneConstruite

    @property
    def proxy_class(self) -> type:
        properties = {
            "Meta": type("Meta", (), {"proxy": True}),
            "shape_file_path": self.shape_file_path,
            "_departement": self.departement,
            "__module__": __name__,
        }

        if self.mapping:
            properties.update({"mapping": self.mapping})

        if self.type == LayerType.DIFF:
            properties.update(
                {
                    "_year_old": self.year_old,
                    "_year_new": self.year_new,
                }
            )
        elif self.type == LayerType.OCSGE or self.type == LayerType.ZONE_CONSTRUITE:
            properties.update({"_year": self.year})

        return type(self.class_name, (self.get_related_autoload_base_class(),), properties)


def get_year_from_layer_key(layer_key: str) -> int:
    return int(layer_key[:4])


def get_years_from_layer_key(layer_key: str) -> tuple[int, int]:
    return tuple(map(int, layer_key.split("_diff")[0].split("_")))


def get_mapping_from_layer_data(layer_data: dict[str, str] | str) -> dict[str, str] | None:
    if isinstance(layer_data, str):
        return None
    return layer_data.get("mapping")


def get_shapefile_path_from_layer_data(layer_data: dict[str, str] | str) -> str:
    if isinstance(layer_data, str):
        return layer_data
    return layer_data.get("path")


def get_layer_type_from_layer_key(layer_key: str) -> LayerType:
    if "zc" in layer_key:
        return LayerType.ZONE_CONSTRUITE
    elif "diff" in layer_key:
        return LayerType.DIFF
    else:
        return LayerType.OCSGE


def parse_config(raw_config: dict) -> List[Layer]:
    layers = []

    for departement_name, data in raw_config.items():
        departement = get_departement(departement_name)

        for layer_key, layer_data in data.items():
            layer_type = get_layer_type_from_layer_key(layer_key)

            if layer_type == LayerType.DIFF:
                year_old, year_new = get_years_from_layer_key(layer_key)
                year_fields = {
                    "year_old": year_old,
                    "year_new": year_new,
                }
            elif layer_type == LayerType.OCSGE or layer_type == LayerType.ZONE_CONSTRUITE:
                year_fields = {
                    "year": get_year_from_layer_key(layer_key),
                }

            layers.append(
                Layer(
                    shape_file_path=get_shapefile_path_from_layer_data(layer_data),
                    mapping=get_mapping_from_layer_data(layer_data),
                    departement=departement,
                    type=layer_type,
                    **year_fields,
                )
            )

    return layers


class Command(BaseCommand):
    help = "Load all data from OCS GE"

    def add_arguments(self, parser):
        parser.add_argument(
            "--all",
            action="store_true",
            help="load all data",
        )
        parser.add_argument(
            "--layer-type",
            type=LayerType,
            help="layer type that you want to load ex: ocsge, zone_construite, diff",
        )
        parser.add_argument(
            "--departement",
            type=str,
            help="item that you want to load ex: GersOcsge2016, ZoneConstruite2019...",
        )

        parser.add_argument(
            "--year_range",
            type=int,
            nargs=2,
            help="year range that you want to load ex: 2016 2019...",
        )

        parser.add_argument(
            "--truncate",
            action="store_true",
            help="if you want to completly restart tables including id, not compatible " "with --item",
        )

    def filter_layers_by_year_range(self, layers: List[Layer], year_range_filter: tuple[int, int]) -> List[Layer]:
        start_range = year_range_filter[0]
        end_range = year_range_filter[1] + 1

        year_range = range(start_range, end_range)
        filtered_layers = []

        for layer in layers:
            if layer.type == LayerType.DIFF:
                if layer.year_old in year_range and layer.year_new in year_range:
                    filtered_layers.append(layer)
            elif layer.type == LayerType.OCSGE or layer.type == LayerType.ZONE_CONSTRUITE:
                if layer.year in year_range:
                    filtered_layers.append(layer)

        return filtered_layers

    def filter_layers(self, options: dict, layers: List[Layer]) -> List[Layer]:
        filtered_layers = layers

        year_range_filter = options.get("year_range")
        departement_filter = options.get("departement")
        layer_type_filter = options.get("layer_type")

        if not year_range_filter and not departement_filter and not layer_type_filter:
            if not options.get("all"):
                raise ValueError(
                    "You must pass the --all flag to load everything",
                    "Otherwise use one of the following filters: --year_range, --departement, --layer_type",
                )

        if year_range_filter:
            filtered_layers = self.filter_layers_by_year_range(
                layers=filtered_layers, year_range_filter=year_range_filter
            )

        if layer_type_filter:
            layer_type = LayerType(layer_type_filter)
            filtered_layers = list(filter(lambda layer: layer.type == layer_type, filtered_layers))

        if departement_filter:
            departement = get_departement(departement_filter)
            filtered_layers = list(filter(lambda layer: layer.departement.name == departement.name, filtered_layers))

        return filtered_layers

    def handle(self, *args, **options):
        with open(CONFIG_PATH, "r") as f:
            layers = parse_config(raw_config=json.load(f))

        layers = self.filter_layers(options=options, layers=layers)

        logger.info("Load data for: %s", ", ".join([layer.class_name for layer in layers]))

        for layer in layers:
            if options.get("truncate"):
                layer.proxy_class.truncate()
            layer.proxy_class.load()
