/*
    Test: Vérifier qu'un territoire ne se référence pas lui-même comme territoire similaire
*/

SELECT
    land_id,
    land_type,
    similar_land_id
FROM
    {{ ref('for_app_similar_territories') }}
WHERE
    land_id = similar_land_id
