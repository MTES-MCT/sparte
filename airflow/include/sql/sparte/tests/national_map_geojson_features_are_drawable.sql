/*
    Chaque entité d'un fond de la carte nationale peut être dessinée et reliée à ses
    données : un land_id, une géométrie surfacique non vide, et une seule entité par
    land_id dans sa FeatureCollection (la carte joint les valeurs par land_id).
*/

WITH features AS (
    SELECT
        geojson.land_id,
        geojson.land_type,
        geojson.child_land_type,
        feature -> 'properties' ->> 'land_id' AS child_land_id,
        coalesce(
            feature -> 'geometry' ->> 'type' IN ('Polygon', 'MultiPolygon')
            AND jsonb_array_length(feature -> 'geometry' -> 'coordinates') > 0,
            false
        ) AS has_surface
    FROM {{ ref('for_app_national_map_geojson') }} AS geojson
    CROSS JOIN jsonb_array_elements(geojson.geojson -> 'features') AS feature
)

SELECT
    land_id,
    land_type,
    child_land_type,
    child_land_id,
    count(*) AS occurrences,
    bool_and(has_surface) AS has_surface
FROM features
GROUP BY land_id, land_type, child_land_type, child_land_id
HAVING child_land_id IS NULL
    OR count(*) > 1
    OR NOT bool_and(has_surface)
