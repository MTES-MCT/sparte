from uuid import UUID

import pytest
from include.domain.container import Container


def test_tmp_path_generator_without_argument_saves_to_tmp_folder():
    container = Container()
    tmp_path_generator = container.tmp_path_generator()
    tmp_path = tmp_path_generator.get_tmp_path()
    assert tmp_path.startswith("/tmp/")


def test_tmp_path_generator_with_argument_saves_to_specified_folde():
    container = Container()
    custom_tmp_dir = "/custom_tmp"
    tmp_path_generator = container.tmp_path_generator(tmp_dir=custom_tmp_dir)
    tmp_path = tmp_path_generator.get_tmp_path()
    assert tmp_path.startswith(custom_tmp_dir)


def test_get_tmp_path_returns_different_path_for_different_calls():
    container = Container()
    tmp_path_generator = container.tmp_path_generator()
    tmp_path_1 = tmp_path_generator.get_tmp_path()
    tmp_path_2 = tmp_path_generator.get_tmp_path()
    assert tmp_path_1 != tmp_path_2


def test_get_tmp_path_with_filename_argument():
    container = Container()
    filename = "test.csv"
    tmp_path_generator = container.tmp_path_generator()
    tmp_path = tmp_path_generator.get_tmp_path(filename=filename)
    assert tmp_path == f"/tmp/{filename}"


def test_get_tmp_path_with_filename_argument_and_custom_tmp_dir():
    container = Container()
    filename = "test.csv"
    custom_tmp_dir = "/custom_tmp"
    tmp_path_generator = container.tmp_path_generator(tmp_dir=custom_tmp_dir)
    tmp_path = tmp_path_generator.get_tmp_path(filename=filename)
    assert tmp_path == f"{custom_tmp_dir}/{filename}"


def test_get_tmp_path_without_filename_argument_returns_a_uuid_filename():
    container = Container()
    tmp_path_generator = container.tmp_path_generator()
    tmp_path = tmp_path_generator.get_tmp_path()
    uuid_filename = tmp_path.split("/")[-1]
    try:
        UUID(uuid_filename, version=4)
    except ValueError:
        pytest.fail("Filename is not a valid UUID")
