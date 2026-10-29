from unittest.mock import MagicMock, patch

import py7zr
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


def test_extracts_a_real_archive(tmp_path):
    """Extraction réelle : garantit que l'API de py7zr utilisée par le handler fonctionne avec la version installée."""
    source_dir = tmp_path / "source"
    (source_dir / "sub").mkdir(parents=True)
    (source_dir / "a.txt").write_text("contenu A")
    (source_dir / "sub" / "b.txt").write_text("contenu B")
    archive_path = tmp_path / "archive.7z"
    with py7zr.SevenZipFile(archive_path, mode="w") as archive:
        archive.writeall(source_dir, arcname="data")

    extract_dir = tmp_path / "out" / "nested"
    SevenZArchiveHandler().extract(str(archive_path), str(extract_dir))

    assert (extract_dir / "data" / "a.txt").read_text() == "contenu A"
    assert (extract_dir / "data" / "sub" / "b.txt").read_text() == "contenu B"
