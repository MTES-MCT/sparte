def get_normalized_fields(
    shapefile_fields: list[str],
    possible_normalized_fields: list[dict[str, str]],
) -> dict[str, str]:
    """
    Check if all the expected fields are present in one of the possible_normalized_fields
    Otherwise raise a ValueError
    """
    for normalized_fields in possible_normalized_fields:
        if set(normalized_fields.values()).issubset(set(shapefile_fields)):
            print(f"Normalized fields found : {normalized_fields}")
            return normalized_fields

    raise ValueError(
        f"Could not find the normalized fields in the shapefile. Shapefile fields are : {shapefile_fields}"
    )


def ocsge_diff_normalization_sql(
    years: list[int],
    departement: str,
    shapefile_name: str,
    loaded_date: float,
    fields: list[str],
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
        GEOMETRY as geom
    FROM
        {shapefile_name}
    """


def ocsge_occupation_du_sol_normalization_sql(
    years: list[int],
    departement: str,
    shapefile_name: str,
    loaded_date: float,
    fields: list[str],
) -> str:
    possible_normalized_fields = [
        {
            "code_cs": "code_cs",
            "code_us": "code_us",
        },
        {
            "code_cs": "couverture",
            "code_us": "usage",
        },
    ]
    normalized_fields = get_normalized_fields(
        shapefile_fields=fields,
        possible_normalized_fields=possible_normalized_fields,
    )

    return f""" SELECT
        {loaded_date} AS loaded_date,
        ID AS id,
        {normalized_fields['code_cs']} AS code_cs,
        {normalized_fields['code_us']} AS code_us,
        GEOMETRY AS geom,
        '{departement}' AS departement,
        {years[0]} AS year,
        CreateUUID() as uuid
    FROM
        {shapefile_name}
    """


def ocsge_zone_construite_normalization_sql(
    years: list[int],
    departement: str,
    shapefile_name: str,
    loaded_date: float,
    fields: list[str],
) -> str:
    print(fields)
    return f""" SELECT
        {loaded_date} AS loaded_date,
        ID AS id,
        {years[0]} AS year,
        '{departement}' AS departement,
        CreateUUID() as uuid,
        GEOMETRY AS geom
    FROM
        {shapefile_name}
    """
