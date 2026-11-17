/*
    La limite d'un parent traverse chacune de ses entités à cheval. Une coupe qui n'aurait
    pas rejoint le contour de l'entité ne la découperait pas : l'entité serait alors tout
    entière dans le parent, ou tout entière dehors, et la limite la contournerait.

    'T********' : l'intérieur de la limite rencontre l'intérieur de l'entité.
*/

SELECT
    boundary.land_id,
    boundary.land_type,
    child.land_id AS child_land_id
FROM {{ ref('land_national_map_parent_boundary_geom') }} AS boundary
JOIN {{ ref('land') }} AS child
    ON child.parent_keys @> ARRAY[boundary.land_type || '_' || boundary.land_id]
    AND child.land_type = boundary.child_land_type
JOIN {{ ref('land_national_map_geom') }} AS light
    ON light.land_id = child.land_id
    AND light.land_type = child.land_type
WHERE cardinality(array(
        SELECT 1
        FROM unnest(child.parent_keys) AS parent_key
        WHERE starts_with(parent_key, boundary.land_type || '_')
    )) > 1
    AND NOT ST_Relate(boundary.geom, light.geom, 'T********')
