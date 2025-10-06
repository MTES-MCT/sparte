def ocsge_artif_normalization_sql(
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
        code_cs AS code_cs,
        code_us AS code_us,
        millesime AS millesime,
        artif AS artif,
        crit_seuil AS crit_seuil,
        CreateUUID() as uuid,
        {geom_field} AS geom
    FROM
        {layer_name}
    """
