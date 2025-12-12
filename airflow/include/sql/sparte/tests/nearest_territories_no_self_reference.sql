/*
    Test pour s'assurer qu'un territoire n'est jamais son propre territoire le plus proche.
*/

SELECT
    land_id,
    land_type,
    nearest_land_id
FROM {{ ref('for_app_nearest_territories') }}
WHERE land_id = nearest_land_id
