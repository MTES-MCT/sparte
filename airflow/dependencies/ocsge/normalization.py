def ocsge_diff_normalization_sql(
    years: list[int],
    departement: str,
    shapefile_name: str,
    loaded_date: float,
) -> str:
    fields = {
        "cs_new": f"CS_{years[1]}",
        "cs_old": f"CS_{years[0]}",
        "us_new": f"US_{years[1]}",
        "us_old": f"US_{years[0]}",
        "year_old": years[0],
        "year_new": years[1],
    }

    return f"""
    SELECT
        {loaded_date} AS loaded_date,
        {fields['year_old']} AS year_old,
        {fields['year_new']} AS year_new,
        {fields['cs_new']} AS cs_new,
        {fields['cs_old']} AS cs_old,
        {fields['us_new']} AS us_new,
        {fields['us_old']} AS us_old,
        cast({departement} as text) AS departement,
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
) -> str:
    return f""" SELECT
        {loaded_date} AS loaded_date,
        ID AS id,
        code_cs AS code_cs,
        code_us AS code_us,
        GEOMETRY AS geom,
        cast({departement} as text) AS departement,
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
) -> str:
    return f""" SELECT
        {loaded_date} AS loaded_date,
        ID AS id,
        {years[0]} AS year,
        cast({departement} as text) AS departement,
        CreateUUID() as uuid,
        GEOMETRY AS geom
    FROM
        {shapefile_name}
    """
