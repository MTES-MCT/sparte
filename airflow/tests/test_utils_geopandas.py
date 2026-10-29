import geopandas as gpd
from include.utils import get_shapefile_or_geopackage_fields
from shapely.geometry import Point


def test_get_geopackage_fields_lists_attributes_and_geometry(tmp_path):
    """Lecture réelle d'un GeoPackage : vérifie l'API de geopandas utilisée par include.utils."""
    gdf = gpd.GeoDataFrame(
        {"code": ["01", "02"], "surface": [1.5, 2.5]},
        geometry=[Point(0, 0), Point(1, 1)],
        crs="EPSG:2154",
    )
    path = tmp_path / "zones.gpkg"
    gdf.to_file(path, driver="GPKG")

    assert get_shapefile_or_geopackage_fields(str(path)) == ["code", "surface", "geometry"]
