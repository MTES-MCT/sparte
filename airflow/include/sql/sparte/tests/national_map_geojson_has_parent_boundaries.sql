/*
    Chaque limite de parent calculée dont au moins une entité est à cheval est servie par
    le fond correspondant, et aucun autre fond n'en porte : le membre `parent_boundary` du
    GeoJSON existe pour les couples parent / maille de
    land_national_map_parent_boundary_geom qui ont une entité à cheval, et pour eux seuls,
    sous la forme des coordonnées d'un MultiLineString (une liste de lignes non vide).
    Sans entité à cheval, la limite ne serait que le contour extérieur du fond.
*/

SELECT
    geojson.land_id,
    geojson.land_type,
    geojson.child_land_type,
    coalesce(boundary.straddling_count > 0, false) AS is_expected,
    jsonb_typeof(geojson.geojson -> 'parent_boundary') AS served_type
FROM {{ ref('for_app_national_map_geojson') }} AS geojson
LEFT JOIN {{ ref('land_national_map_parent_boundary_geom') }} AS boundary
    USING (land_id, land_type, child_land_type)
WHERE coalesce(boundary.straddling_count > 0, false) IS DISTINCT FROM (
    coalesce(jsonb_typeof(geojson.geojson -> 'parent_boundary') = 'array', false)
    AND jsonb_array_length(geojson.geojson -> 'parent_boundary') > 0
)
