from dataclasses import dataclass


@dataclass(frozen=True, kw_only=True)
class BaseConfig:
    frequency: str = "@once"
    dag_id: str
    format: str
    filename: str
    data_gouv_dataset: str
    data_gouv_resource: str


@dataclass(frozen=True, kw_only=True)
class GeopackageConfig(BaseConfig):
    sql_to_layer_name_mapping: dict


@dataclass(frozen=True, kw_only=True)
class CSVConfig(BaseConfig):
    sql: str


class ConfigParser:
    def __get_config_class(self, format: str):
        parser_map = {
            "csv": CSVConfig,
            "gpkg": GeopackageConfig,
        }

        if format not in parser_map:
            raise ValueError(f"Le format {format} n'est pas pris en charge")

        return parser_map[format]

    def parse_config(self, data: dict):
        if "format" not in data:
            raise ValueError("Le format est manquant dans la configuration", data)

        return self.__get_config_class(data["format"])(**data)
