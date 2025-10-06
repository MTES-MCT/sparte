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
