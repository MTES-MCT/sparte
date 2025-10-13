from .get_normalized_fields import get_normalized_fields


def ocsge_occupation_du_sol_normalization_sql(
    years: list[int],
    departement: str,
    layer_name: str,
    loaded_date: float,
    fields: list[str],
    geom_field: str,
) -> str:
    possible_normalized_fields = [
        {
            "code_cs": "code_cs",
            "code_us": "code_us",
        },
        {
            "code_cs": "CODE_CS",
            "code_us": "CODE_US",
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
        {geom_field} AS geom,
        '{departement}' AS departement,
        {years[0]} AS year,
        CreateUUID() as uuid
    FROM
        {layer_name}
    """
