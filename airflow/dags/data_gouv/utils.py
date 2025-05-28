from typing import Optional

from dags.data_gouv.Config import BaseConfig, ConfigParser

from .configs import configs


def get_configs(
    file_format: Optional[str] = None,
) -> list[BaseConfig]:
    config_parser = ConfigParser()
    parsed_configs: list[BaseConfig] = [config_parser.parse_config(raw_config) for raw_config in configs]

    if not file_format:
        return parsed_configs

    filtered_configs = [config for config in parsed_configs if config.format == file_format]

    return filtered_configs
