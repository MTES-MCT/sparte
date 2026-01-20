from unittest.mock import MagicMock, patch

import pytest
from include.file_handling import PaginatedJsonToS3Handler


@pytest.fixture
def mock_s3_handler():
    handler = MagicMock()
    handler.upload_file.return_value = "s3://bucket/key"
    return handler


@pytest.fixture
def mock_tmp_path_generator():
    generator = MagicMock()
    generator.get_tmp_path.return_value = "/tmp/test_file.json"
    return generator


@pytest.fixture
def handler(mock_s3_handler, mock_tmp_path_generator):
    return PaginatedJsonToS3Handler(
        s3_handler=mock_s3_handler,
        tmp_path_generator=mock_tmp_path_generator,
    )


@patch("include.file_handling.PaginatedJsonToS3Handler.os.remove")
@patch("include.file_handling.PaginatedJsonToS3Handler.requests.get")
@patch("builtins.open", create=True)
def test_download_single_page(mock_open, mock_get, mock_remove, handler, mock_s3_handler):
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "data": [{"id": 1}, {"id": 2}],
        "next_page": None,
    }
    mock_response.raise_for_status = MagicMock()
    mock_get.return_value = mock_response

    mock_file = MagicMock()
    mock_open.return_value.__enter__.return_value = mock_file

    result = handler.download_paginated_json_and_upload_to_s3(
        url="https://api.example.com/data",
        s3_key="output.json",
        s3_bucket="my-bucket",
    )

    assert result == "s3://bucket/key"
    mock_get.assert_called_once_with("https://api.example.com/data")
    mock_s3_handler.upload_file.assert_called_once()


@patch("include.file_handling.PaginatedJsonToS3Handler.os.remove")
@patch("include.file_handling.PaginatedJsonToS3Handler.requests.get")
@patch("builtins.open", create=True)
def test_download_multiple_pages(mock_open, mock_get, mock_remove, handler, mock_s3_handler):
    responses = [
        MagicMock(
            json=MagicMock(
                return_value={
                    "data": [{"id": 1}, {"id": 2}],
                    "next_page": "https://api.example.com/data?page=2",
                }
            ),
            raise_for_status=MagicMock(),
        ),
        MagicMock(
            json=MagicMock(
                return_value={
                    "data": [{"id": 3}],
                    "next_page": "https://api.example.com/data?page=3",
                }
            ),
            raise_for_status=MagicMock(),
        ),
        MagicMock(
            json=MagicMock(
                return_value={
                    "data": [{"id": 4}, {"id": 5}],
                    "next_page": None,
                }
            ),
            raise_for_status=MagicMock(),
        ),
    ]
    mock_get.side_effect = responses

    mock_file = MagicMock()
    mock_open.return_value.__enter__.return_value = mock_file

    result = handler.download_paginated_json_and_upload_to_s3(
        url="https://api.example.com/data",
        s3_key="output.json",
        s3_bucket="my-bucket",
    )

    assert result == "s3://bucket/key"
    assert mock_get.call_count == 3


@patch("include.file_handling.PaginatedJsonToS3Handler.os.remove")
@patch("include.file_handling.PaginatedJsonToS3Handler.requests.get")
@patch("builtins.open", create=True)
def test_download_with_custom_keys(mock_open, mock_get, mock_remove, handler):
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "items": [{"id": 1}],
        "next": "https://api.example.com/data?page=2",
    }
    mock_response.raise_for_status = MagicMock()

    mock_response_2 = MagicMock()
    mock_response_2.json.return_value = {
        "items": [{"id": 2}],
        "next": None,
    }
    mock_response_2.raise_for_status = MagicMock()

    mock_get.side_effect = [mock_response, mock_response_2]

    mock_file = MagicMock()
    mock_open.return_value.__enter__.return_value = mock_file

    handler.download_paginated_json_and_upload_to_s3(
        url="https://api.example.com/data",
        s3_key="output.json",
        s3_bucket="my-bucket",
        next_page_key="next",
        data_key="items",
    )

    assert mock_get.call_count == 2


@patch("include.file_handling.PaginatedJsonToS3Handler.os.remove")
@patch("include.file_handling.PaginatedJsonToS3Handler.requests.get")
@patch("include.file_handling.PaginatedJsonToS3Handler.json.dump")
@patch("builtins.open", create=True)
def test_aggregates_all_data(mock_open, mock_json_dump, mock_get, mock_remove, handler):
    responses = [
        MagicMock(
            json=MagicMock(
                return_value={
                    "data": [{"id": 1}, {"id": 2}],
                    "next_page": "https://api.example.com/data?page=2",
                }
            ),
            raise_for_status=MagicMock(),
        ),
        MagicMock(
            json=MagicMock(
                return_value={
                    "data": [{"id": 3}],
                    "next_page": None,
                }
            ),
            raise_for_status=MagicMock(),
        ),
    ]
    mock_get.side_effect = responses

    handler.download_paginated_json_and_upload_to_s3(
        url="https://api.example.com/data",
        s3_key="output.json",
        s3_bucket="my-bucket",
    )

    dumped_data = mock_json_dump.call_args[0][0]
    assert len(dumped_data) == 3
    assert dumped_data == [{"id": 1}, {"id": 2}, {"id": 3}]


@patch("include.file_handling.PaginatedJsonToS3Handler.os.remove")
@patch("include.file_handling.PaginatedJsonToS3Handler.requests.get")
@patch("builtins.open", create=True)
def test_removes_temp_file_after_upload(mock_open, mock_get, mock_remove, handler, mock_tmp_path_generator):
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "data": [{"id": 1}],
        "next_page": None,
    }
    mock_response.raise_for_status = MagicMock()
    mock_get.return_value = mock_response

    mock_file = MagicMock()
    mock_open.return_value.__enter__.return_value = mock_file

    handler.download_paginated_json_and_upload_to_s3(
        url="https://api.example.com/data",
        s3_key="output.json",
        s3_bucket="my-bucket",
    )

    mock_remove.assert_called_once_with("/tmp/test_file.json")
