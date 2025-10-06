from .get_normalized_fields import get_normalized_fields


def ocsge_diff_normalization_sql(
    years: list[int],
    departement: str,
    layer_name: str,
    loaded_date: float,
    fields: list[str],
    geom_field: str,
) -> str:
    possible_normalized_fields = [
        {
            "cs_new": f"CS_{years[1]}",
            "cs_old": f"CS_{years[0]}",
            "us_new": f"US_{years[1]}",
            "us_old": f"US_{years[0]}",
        },
        {
            "cs_new": "cs_apres",
            "cs_old": "cs_avant",
            "us_new": "us_apres",
            "us_old": "us_avant",
        },
    ]
    normalized_fields = get_normalized_fields(
        shapefile_fields=fields,
        possible_normalized_fields=possible_normalized_fields,
    )

    return f"""
    SELECT
        {loaded_date} AS loaded_date,
        {years[0]} AS year_old,
        {years[1]} AS year_new,
        {normalized_fields['cs_new']} AS cs_new,
        {normalized_fields['cs_old']} AS cs_old,
        {normalized_fields['us_new']} AS us_new,
        {normalized_fields['us_old']} AS us_old,
        '{departement}' AS departement,
        CreateUUID() as uuid,
        {geom_field} as geom
    FROM
        {layer_name}
    """
