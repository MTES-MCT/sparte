import subprocess
from unittest.mock import MagicMock, patch

import pytest
from include.file_handling import S3GeopackageArchiveToDBTablesHandler

MODULE = "include.file_handling.S3GeopackageArchiveToDBTablesHandler"


@pytest.fixture
def mock_s3_handler():
    return MagicMock()


@pytest.fixture
def mock_archive_handler():
    return MagicMock()


@pytest.fixture
def mock_tmp_path_generator():
    generator = MagicMock()
    # 1er appel -> archive 7z, 2e appel -> dossier d'extraction
    generator.get_tmp_path.side_effect = ["/tmp/archive.7z", "/tmp/extract"]
    return generator


@pytest.fixture
def handler(mock_s3_handler, mock_archive_handler, mock_tmp_path_generator):
    return S3GeopackageArchiveToDBTablesHandler(
        s3_handler=mock_s3_handler,
        archive_handler=mock_archive_handler,
        tmp_path_generator=mock_tmp_path_generator,
        db_connection="PG:dbname=test",
    )


def _commands(mock_run):
    """Concatène les commandes ogr2ogr passées à subprocess.run."""
    return " ".join(c.args[0] for c in mock_run.call_args_list)


@patch(f"{MODULE}.subprocess.run")
@patch(f"{MODULE}.os.walk")
@patch(f"{MODULE}.os.path.exists", return_value=True)
@patch(f"{MODULE}.os.remove")
@patch(f"{MODULE}.shutil.rmtree")
def test_downloads_extracts_and_ingests_each_layer(
    mock_rmtree,
    mock_remove,
    mock_exists,
    mock_walk,
    mock_run,
    handler,
    mock_s3_handler,
    mock_archive_handler,
):
    mock_walk.return_value = [("/tmp/extract/ADE", [], ["other.txt", "ADMIN.gpkg"])]
    mock_run.return_value = MagicMock(stdout="", stderr="")

    handler.ingest_s3_geopackage_archive_to_db_tables(
        s3_bucket="my-bucket",
        s3_key="admin.7z",
        layer_to_table={"commune": "commune_metropole", "region": "region_metropole"},
        srid=2154,
    )

    # L'archive est téléchargée depuis S3 vers le chemin temporaire
    mock_s3_handler.download_file.assert_called_once_with(
        s3_key="admin.7z",
        s3_bucket="my-bucket",
        local_file_path="/tmp/archive.7z",
    )
    # L'extraction est déléguée à l'archive handler
    mock_archive_handler.extract.assert_called_once_with("/tmp/archive.7z", "/tmp/extract")

    # Un ogr2ogr par couche, vers la bonne table, depuis le .gpkg trouvé, avec le bon SRID
    assert mock_run.call_count == 2
    commands = _commands(mock_run)
    assert "commune_metropole" in commands
    assert "region_metropole" in commands
    assert "/tmp/extract/ADE/ADMIN.gpkg" in commands
    assert "EPSG:2154" in commands

    # Nettoyage de l'archive et du dossier d'extraction
    mock_remove.assert_called_once_with("/tmp/archive.7z")
    mock_rmtree.assert_called_once_with("/tmp/extract")


@patch(f"{MODULE}.subprocess.run")
@patch(f"{MODULE}.os.walk")
@patch(f"{MODULE}.os.path.exists", return_value=True)
@patch(f"{MODULE}.os.remove")
@patch(f"{MODULE}.shutil.rmtree")
def test_raises_and_cleans_up_when_no_gpkg_found(
    mock_rmtree,
    mock_remove,
    mock_exists,
    mock_walk,
    mock_run,
    handler,
):
    mock_walk.return_value = [("/tmp/extract", [], ["readme.txt"])]

    with pytest.raises(FileNotFoundError):
        handler.ingest_s3_geopackage_archive_to_db_tables(
            s3_bucket="my-bucket",
            s3_key="admin.7z",
            layer_to_table={"commune": "commune_metropole"},
            srid=2154,
        )

    # Aucune ingestion ogr2ogr lancée
    mock_run.assert_not_called()
    # Le nettoyage a quand même eu lieu (finally)
    mock_remove.assert_called_once_with("/tmp/archive.7z")
    mock_rmtree.assert_called_once_with("/tmp/extract")


@patch(f"{MODULE}.subprocess.run")
@patch(f"{MODULE}.os.walk")
@patch(f"{MODULE}.os.path.exists", return_value=True)
@patch(f"{MODULE}.os.remove")
@patch(f"{MODULE}.shutil.rmtree")
def test_raises_and_cleans_up_when_ogr2ogr_fails(
    mock_rmtree,
    mock_remove,
    mock_exists,
    mock_walk,
    mock_run,
    handler,
):
    mock_walk.return_value = [("/tmp/extract", [], ["ADMIN.gpkg"])]
    mock_run.side_effect = subprocess.CalledProcessError(returncode=1, cmd="ogr2ogr", stderr="boom")

    with pytest.raises(subprocess.CalledProcessError):
        handler.ingest_s3_geopackage_archive_to_db_tables(
            s3_bucket="my-bucket",
            s3_key="admin.7z",
            layer_to_table={"commune": "commune_metropole"},
            srid=2154,
        )

    # Le nettoyage a quand même eu lieu (finally)
    mock_remove.assert_called_once_with("/tmp/archive.7z")
    mock_rmtree.assert_called_once_with("/tmp/extract")
