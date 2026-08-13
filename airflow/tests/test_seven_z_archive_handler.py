from unittest.mock import MagicMock, patch

from include.file_handling import BaseArchiveHandler, SevenZArchiveHandler

MODULE = "include.file_handling.SevenZArchiveHandler"


def test_is_a_base_archive_handler():
    assert isinstance(SevenZArchiveHandler(), BaseArchiveHandler)


@patch(f"{MODULE}.py7zr.SevenZipFile")
@patch(f"{MODULE}.os.makedirs")
def test_extract_creates_dir_and_extracts_archive(mock_makedirs, mock_sevenzip):
    archive = MagicMock()
    mock_sevenzip.return_value.__enter__.return_value = archive

    SevenZArchiveHandler().extract("/tmp/archive.7z", "/tmp/extract")

    mock_makedirs.assert_called_once_with("/tmp/extract", exist_ok=True)
    mock_sevenzip.assert_called_once_with("/tmp/archive.7z", mode="r")
    archive.extractall.assert_called_once_with(path="/tmp/extract")
