/*
    Les tuiles de communes de la carte nationale contiennent exactement les communes de
    `land` : une commune absente laisserait un trou dans la carte, une commune en trop
    resterait grise, sans valeur à lui joindre.

    Le test retourne les communes de `land` absentes des tuiles et les entités des tuiles
    qui ne sont pas une commune de `land`.
*/

SELECT
    coalesce(land.land_id, tiles.land_id) AS land_id,
    land.land_id IS NULL AS is_missing_from_land,
    tiles.land_id IS NULL AS is_missing_from_tiles
FROM (
    SELECT land_id
    FROM {{ ref('land') }}
    WHERE land_type = '{{ var("COMMUNE") }}'
) AS land
FULL JOIN {{ ref('for_vector_tiles_communes_national') }} AS tiles
    ON tiles.land_id = land.land_id
WHERE land.land_id IS NULL
    OR tiles.land_id IS NULL
