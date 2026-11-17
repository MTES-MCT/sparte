/*
    Chaque département qui a au moins un EPCI a sa limite pour le fond par EPCI. Un
    département absent ici s'afficherait sans limite, alors que ses EPCI à cheval
    débordent.
*/

SELECT DISTINCT
    split_part(parent_key, '_', 2) AS land_id,
    split_part(parent_key, '_', 1) AS land_type
FROM {{ ref('land') }} AS child
CROSS JOIN unnest(child.parent_keys) AS parent_key
LEFT JOIN {{ ref('land_national_map_parent_boundary_geom') }} AS boundary
    ON boundary.land_type || '_' || boundary.land_id = parent_key
    AND boundary.child_land_type = child.land_type
WHERE child.land_type = '{{ var("EPCI") }}'
    AND split_part(parent_key, '_', 1) = '{{ var("DEPARTEMENT") }}'
    AND boundary.land_id IS NULL
