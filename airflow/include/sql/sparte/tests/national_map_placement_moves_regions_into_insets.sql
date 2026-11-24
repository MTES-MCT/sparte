/*
    Le placement des DROM de la carte nationale donne, pour chaque région, une
    transformation (facteur et translation) et un cartouche. Les deux doivent dire la même
    chose : la région, déplacée par la macro national_map_apply_drom_placement comme le
    sont les communes des tuiles, occupe exactement son cartouche.

    Sans ce contrôle, un cartouche juste (comparé aux fonds servis par Django) pourrait
    cacher une translation fausse, et les communes seraient dessinées à côté de leur région.

    Le test retourne les régions dont l'emprise déplacée s'écarte du cartouche de plus de 1 mm.
*/

WITH moved AS (
    SELECT
        placement.region_code,
        placement.inset_geom,
        {{ national_map_apply_drom_placement('ST_Transform(region.geom, 3857)', 'placement') }} AS geom
    FROM {{ ref('national_map_drom_placement') }} AS placement
    JOIN {{ ref('land_national_map_geom') }} AS region
        ON region.land_id = placement.region_code
        AND region.land_type = '{{ var("REGION") }}'
)

SELECT
    region_code,
    ST_AsText(inset_geom) AS inset_geom,
    ST_XMin(geom) AS moved_x_min,
    ST_YMin(geom) AS moved_y_min,
    ST_XMax(geom) AS moved_x_max,
    ST_YMax(geom) AS moved_y_max
FROM moved
WHERE abs(ST_XMin(geom) - ST_XMin(inset_geom)) > 0.001
    OR abs(ST_YMin(geom) - ST_YMin(inset_geom)) > 0.001
    OR abs(ST_XMax(geom) - ST_XMax(inset_geom)) > 0.001
    OR abs(ST_YMax(geom) - ST_YMax(inset_geom)) > 0.001
