from dataclasses import dataclass


@dataclass(frozen=True, kw_only=True)
class ResourceConfig:
    format: str
    filename: str
    resource_slug: str
    resource_title: str


@dataclass(frozen=True, kw_only=True)
class GeopackageResourceConfig(ResourceConfig):
    sql_to_layer_name_mapping: dict


@dataclass(frozen=True, kw_only=True)
class CSVResourceConfig(ResourceConfig):
    sql: str


@dataclass(frozen=True, kw_only=True)
class DatasetConfig:
    dataset_slug: str
    dataset_title: str
    frequency: str = "@once"
    resources: tuple[ResourceConfig, ...] = ()


class ConfigParser:
    def __get_resource_config_class(self, format: str):
        parser_map = {
            "csv": CSVResourceConfig,
            "gpkg": GeopackageResourceConfig,
        }

        if format not in parser_map:
            raise ValueError(f"Le format {format} n'est pas pris en charge")

        return parser_map[format]

    def parse_resource(self, data: dict) -> ResourceConfig:
        if "format" not in data:
            raise ValueError("Le format est manquant dans la configuration", data)

        return self.__get_resource_config_class(data["format"])(**data)

    def parse_config(self, data: dict) -> DatasetConfig:
        if "dataset_title" not in data:
            raise ValueError("Le dataset_title est manquant dans la configuration", data)

        if "dataset_slug" not in data:
            raise ValueError("Le dataset_slug est manquant dans la configuration", data)

        resources = tuple(self.parse_resource(resource_data) for resource_data in data.get("resources", []))

        return DatasetConfig(
            dataset_slug=data["dataset_slug"],
            dataset_title=data["dataset_title"],
            frequency=data.get("frequency", "@once"),
            resources=resources,
        )
