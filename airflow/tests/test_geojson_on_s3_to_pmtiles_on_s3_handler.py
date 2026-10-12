import json
import os
import shutil
from unittest.mock import MagicMock

import pytest
from include.file_handling import GeoJsonOnS3ToPmtilesOnS3Handler

pytestmark = pytest.mark.skipif(shutil.which("tippecanoe") is None, reason="tippecanoe n'est pas installé")

# -zg a besoin d'au moins deux emplacements distincts pour choisir un zoom max
FEATURES = [
    {
        "type": "Feature",
        "properties": {"name": "a"},
        "geometry": {"type": "Point", "coordinates": [2.35, 48.85]},
    },
    {
        "type": "Feature",
        "properties": {"name": "b"},
        "geometry": {"type": "Point", "coordinates": [2.36, 48.86]},
    },
]


def make_s3_handler(features: list[dict]) -> MagicMock:
    """
    Faux S3 : download_file écrit un GeoJSON contenant `features`, upload_file
    copie le fichier uploadé dans `uploaded` pour pouvoir l'inspecter ensuite.
    """
    s3_handler = MagicMock()
    s3_handler.uploaded = {}

    def download_file(s3_bucket, s3_key, local_file_path):
        with open(local_file_path, "w") as f:
            json.dump({"type": "FeatureCollection", "features": features}, f)
        return local_file_path

    def upload_file(local_file_path, s3_bucket, s3_key):
        with open(local_file_path, "rb") as f:
            s3_handler.uploaded[s3_key] = f.read()
        return f"{s3_bucket}/{s3_key}"

    s3_handler.download_file.side_effect = download_file
    s3_handler.upload_file.side_effect = upload_file
    return s3_handler


def test_converts_geojson_and_uploads_pmtiles():
    s3_handler = make_s3_handler(FEATURES)
    handler = GeoJsonOnS3ToPmtilesOnS3Handler(s3_handler=s3_handler)

    result = handler.convert_geojson_to_pmtiles_on_s3(
        s3_bucket="bucket",
        s3_geojson_key="vector_tiles/test.geojson",
        s3_pmtiles_key="vector_tiles/test.pmtiles",
    )

    assert result == "bucket/vector_tiles/test.pmtiles"
    assert s3_handler.uploaded["vector_tiles/test.pmtiles"].startswith(b"PMTiles")


def test_returns_none_when_geojson_has_no_feature():
    s3_handler = make_s3_handler([])
    handler = GeoJsonOnS3ToPmtilesOnS3Handler(s3_handler=s3_handler)

    result = handler.convert_geojson_to_pmtiles_on_s3(
        s3_bucket="bucket",
        s3_geojson_key="vector_tiles/empty.geojson",
        s3_pmtiles_key="vector_tiles/empty.pmtiles",
    )

    assert result is None
    s3_handler.upload_file.assert_not_called()


def test_raises_when_tippecanoe_fails():
    s3_handler = make_s3_handler(FEATURES)
    handler = GeoJsonOnS3ToPmtilesOnS3Handler(s3_handler=s3_handler)

    with pytest.raises(RuntimeError, match="tippecanoe a échoué"):
        handler.convert_geojson_to_pmtiles_on_s3(
            s3_bucket="bucket",
            s3_geojson_key="vector_tiles/test.geojson",
            s3_pmtiles_key="vector_tiles/test.pmtiles",
            tippecanoe_options=["--not-an-option"],
        )

    s3_handler.upload_file.assert_not_called()


def test_leaves_no_local_file(monkeypatch, tmp_path):
    monkeypatch.setenv("TMPDIR", str(tmp_path))
    # tempfile met en cache le dossier temporaire au premier appel
    monkeypatch.setattr("tempfile.tempdir", None)
    s3_handler = make_s3_handler(FEATURES)
    handler = GeoJsonOnS3ToPmtilesOnS3Handler(s3_handler=s3_handler)

    handler.convert_geojson_to_pmtiles_on_s3(
        s3_bucket="bucket",
        s3_geojson_key="vector_tiles/test.geojson",
        s3_pmtiles_key="vector_tiles/test.pmtiles",
    )

    assert os.listdir(tmp_path) == []
