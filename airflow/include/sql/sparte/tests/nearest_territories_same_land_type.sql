/*
    Test pour s'assurer que les territoires les plus proches sont du même type.
*/

SELECT
    nt.land_id,
    nt.land_type,
    nt.nearest_land_id,
    l.land_type as nearest_land_type
FROM {{ ref('for_app_nearest_territories') }} nt
LEFT JOIN {{ ref('land') }} l
    ON nt.nearest_land_id = l.land_id
    AND nt.land_type = l.land_type
WHERE l.land_id IS NULL  -- Le join n'a pas trouvé de correspondance avec le même land_type
