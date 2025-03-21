import pytest
from dags.data_gouv.Config import ConfigParser
from dags.data_gouv.utils import get_configs


def test_running_the_function_without_args():
    get_configs()


def test_getting_only_certains_formats():
    formats = ["csv", "gpkg"]
    for file_format in formats:
        get_configs(file_format=file_format)


def test_all_configs_have_dag_ids():
    configs = get_configs()

    for config in configs:
        assert config.dag_id is not None


def test_config_in_missing_format_raises_error():
    parser = ConfigParser()

    with pytest.raises(
        expected_exception=ValueError,
        match="Le format xyz n'est pas pris en charge",
    ):
        parser.parse_config({"dag_id": "test", "format": "xyz"})
