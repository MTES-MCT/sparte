from .get_normalized_fields import get_normalized_fields


def ocsge_artif_diff_normalization_sql(
    years: list[int],
    departement: str,
    layer_name: str,
    loaded_date: float,
    fields: list[str],
    geom_field: str,
):
    possible_normalized_fields = [
        {
            "cs_new": f"CS_{years[1]}",
            "cs_old": f"CS_{years[0]}",
            "us_new": f"US_{years[1]}",
            "us_old": f"US_{years[0]}",
            "artif_new": f"ARTIF_{years[1]}",
            "artif_old": f"ARTIF_{years[0]}",
        },
        {
            "cs_new": f"cs_{years[1]}",
            "cs_old": f"cs_{years[0]}",
            "us_new": f"us_{years[1]}",
            "us_old": f"us_{years[0]}",
            "artif_new": f"artif_{years[1]}",
            "artif_old": f"artif_{years[0]}",
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
        {normalized_fields['artif_new']} AS artif_new,
        {normalized_fields['artif_old']} AS artif_old,
        '{departement}' AS departement,
        artificialisation as artif,
        CreateUUID() as uuid,
        {geom_field} as geom
    FROM
        {layer_name}
    """
