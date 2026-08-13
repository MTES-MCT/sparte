from dags.ingest_admin_express import admin_express_gpkg_url


def test_builds_cog_url_for_metropole():
    assert admin_express_gpkg_url("ADMIN-EXPRESS-COG", "LAMB93", "FXX") == (
        "https://data.geopf.fr/telechargement/download/ADMIN-EXPRESS-COG/"
        "ADMIN-EXPRESS-COG_4-0__GPKG_LAMB93_FXX_2025-01-01/"
        "ADMIN-EXPRESS-COG_4-0__GPKG_LAMB93_FXX_2025-01-01.7z"
    )


def test_builds_cog_carto_url_for_mayotte():
    assert admin_express_gpkg_url("ADMIN-EXPRESS-COG-CARTO", "RGM04UTM38S", "MYT") == (
        "https://data.geopf.fr/telechargement/download/ADMIN-EXPRESS-COG-CARTO/"
        "ADMIN-EXPRESS-COG-CARTO_4-0__GPKG_RGM04UTM38S_MYT_2025-01-01/"
        "ADMIN-EXPRESS-COG-CARTO_4-0__GPKG_RGM04UTM38S_MYT_2025-01-01.7z"
    )


def test_archive_name_is_repeated_as_dir_and_file():
    url = admin_express_gpkg_url("ADMIN-EXPRESS-COG", "RGAF09UTM20", "GLP")
    archive = "ADMIN-EXPRESS-COG_4-0__GPKG_RGAF09UTM20_GLP_2025-01-01"
    assert url.endswith(f"/{archive}/{archive}.7z")
