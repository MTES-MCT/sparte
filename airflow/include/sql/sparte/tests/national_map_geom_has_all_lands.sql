/*
    Aucun territoire perdu par les fonds allégés de la carte nationale : chaque région,
    département et EPCI de `land` a sa géométrie très simplifiée, et chaque commune a une
    géométrie allégée à l'échelle de sa région et une à l'échelle de son département.
    Un territoire absent ici disparaîtrait de la carte.
*/

SELECT
    land.land_id,
    land.land_type,
    NULL AS parent_key
FROM {{ ref('land') }} AS land
LEFT JOIN {{ ref('land_national_map_geom') }} AS light
    ON light.land_id = land.land_id
    AND light.land_type = land.land_type
WHERE land.land_type IN ('{{ var("REGION") }}', '{{ var("DEPARTEMENT") }}', '{{ var("EPCI") }}')
    AND light.land_id IS NULL

UNION ALL

SELECT
    commune.land_id,
    commune.land_type,
    parent_key
FROM {{ ref('land') }} AS commune
CROSS JOIN unnest(commune.parent_keys) AS parent_key
LEFT JOIN {{ ref('land_national_map_commune_geom') }} AS light
    ON light.land_id = commune.land_id
    AND light.parent_land_type || '_' || light.parent_land_id = parent_key
WHERE commune.land_type = '{{ var("COMMUNE") }}'
    AND split_part(parent_key, '_', 1) IN ('{{ var("REGION") }}', '{{ var("DEPARTEMENT") }}')
    AND light.land_id IS NULL
