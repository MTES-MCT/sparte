import pytest
from dags.data_gouv.Config import ConfigParser
from dags.data_gouv.utils import get_dataset_configs


def test_running_the_function_without_args():
    get_dataset_configs()


def test_all_configs_have_dataset_slug():
    configs = get_dataset_configs()

    for config in configs:
        assert config.dataset_slug is not None


def test_resource_with_missing_format_raises_error():
    parser = ConfigParser()

    with pytest.raises(
        expected_exception=ValueError,
        match="Le format xyz n'est pas pris en charge",
    ):
        parser.parse_resource({"format": "xyz", "filename": "test", "resource_slug": "test", "resource_title": "test"})
