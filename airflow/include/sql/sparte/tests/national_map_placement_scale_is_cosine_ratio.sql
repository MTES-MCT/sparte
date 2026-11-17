/*
    Les DROM de la carte nationale sont dessinés à l'échelle de l'Hexagone : le facteur
    appliqué à chacun est le rapport entre le cosinus de sa latitude et celui de la latitude
    de l'Hexagone, ce qui annule l'étirement de Web Mercator (1 km mesure alors la même
    longueur à l'écran partout).

    La macro tire la latitude de l'ordonnée Web Mercator par une formule ; ce test la
    recalcule autrement, en reprojetant en EPSG:4326 le milieu de chaque emprise. Entre
    l'équateur et les tropiques d'un côté, 46° N de l'autre, le facteur reste entre 1,35
    et 1,45.

    Le test retourne les régions dont le facteur s'écarte de ce rapport ou sort de ces bornes.
*/

WITH latitudes AS (
    SELECT
        placement.region_code,
        placement.scale_factor,
        ST_Y(ST_Transform(
            ST_SetSRID(ST_MakePoint(0, (ST_YMin(region.geom) + ST_YMax(region.geom)) / 2), 3857),
            4326
        )) AS region_latitude,
        ST_Y(ST_Transform(
            ST_SetSRID(
                ST_MakePoint(0, (ST_YMin(placement.reference_geom) + ST_YMax(placement.reference_geom)) / 2),
                3857
            ),
            4326
        )) AS reference_latitude
    FROM {{ ref('national_map_drom_placement') }} AS placement
    JOIN (
        SELECT
            land_id,
            ST_Transform(geom, 3857) AS geom
        FROM {{ ref('land_national_map_geom') }}
        WHERE land_type = '{{ var("REGION") }}'
    ) AS region
        ON region.land_id = placement.region_code
),

expected AS (
    SELECT
        *,
        cos(radians(region_latitude)) / cos(radians(reference_latitude)) AS cosine_ratio
    FROM latitudes
)

SELECT *
FROM expected
WHERE scale_factor NOT BETWEEN 1.35 AND 1.45
    OR abs(scale_factor - cosine_ratio) > 0.000000001
