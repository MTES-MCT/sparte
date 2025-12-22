/*
    Test pour s'assurer que toutes les distances sont positives et supérieures à 0.
*/

SELECT
    land_id,
    land_type,
    nearest_land_id,
    distance_km
FROM {{ ref('for_app_nearest_territories') }}
WHERE distance_km <= 0
