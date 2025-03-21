import json
from typing import Optional

from dags.data_gouv.Config import BaseConfig, ConfigParser


def get_configs(
    file_format: Optional[str] = None,
) -> list[BaseConfig]:
    config_path = "dags/data_gouv/config.json"

    with open(config_path, "r") as file:
        configs = json.load(file)

    config_parser = ConfigParser()

    parsed_configs: list[BaseConfig] = [config_parser.parse_config(raw_config) for raw_config in configs]

    if not file_format:
        return parsed_configs

    filtered_configs = [config for config in parsed_configs if config.format == file_format]

    return filtered_configs
