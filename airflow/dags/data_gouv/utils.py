from dags.data_gouv.Config import ConfigParser, DatasetConfig

from .configs import configs


def get_dataset_configs() -> list[DatasetConfig]:
    config_parser = ConfigParser()
    return [config_parser.parse_config(raw_config) for raw_config in configs]
