def ocsge_zone_construite_normalization_sql(
    years: list[int],
    departement: str,
    layer_name: str,
    loaded_date: float,
    fields: list[str],
    geom_field: str,
) -> str:
    print(fields)
    return f""" SELECT
        {loaded_date} AS loaded_date,
        ID AS id,
        {years[0]} AS year,
        '{departement}' AS departement,
        CreateUUID() as uuid,
        {geom_field} AS geom
    FROM
        {layer_name}
    """
