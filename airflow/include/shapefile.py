import geopandas as gpd


def get_shapefile_fields(shapefile_path: str) -> list[str]:
    df = gpd.read_file(shapefile_path)
    return df.columns.to_list()
