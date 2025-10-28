/*
    Test pour s'assurer que chaque territoire a au maximum 8 territoires les plus proches.
*/

SELECT
    land_id,
    land_type,
    COUNT(*) as count
FROM {{ ref('for_app_nearest_territories') }}
GROUP BY land_id, land_type
HAVING COUNT(*) > 8
