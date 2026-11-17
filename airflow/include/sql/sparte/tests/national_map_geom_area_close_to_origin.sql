/*
    La surface d'un territoire allégé pour la carte nationale reste proche de sa surface
    d'origine. Un écart plus grand signale une face attribuée au mauvais territoire, ou un
    territoire réduit à un éclat.

    Écart relatif toléré : 10 %, porté à 3 × tolérance / côté pour un territoire petit
    devant la tolérance (côté = racine de sa surface), dont chaque frontière déplacée pèse
    davantage. Dans tous les cas le rapport reste entre 0,45 et 2,3, bornes que la macro
    simplify_lands_by_lot garantit par construction (une face n'est attribuée que si le
    territoire en couvre la moitié ; repli sur simple_geom sous la moitié de la surface).

    Seuils fixés sur 8 000 géométries de communes simplifiées en lecture seule (tolérances
    de 18 à 485 m) : écart maximal de 4,4 % quand le côté dépasse 20 tolérances, et écart
    toujours inférieur à 1,8 × tolérance / côté.
*/

{% set max_relative_gap = 0.1 %}
{% set max_gap_in_tolerances = 3 %}

WITH light AS (
    SELECT
        land_id,
        land_type,
        NULL AS parent_land_type,
        tolerance,
        geom
    FROM {{ ref('land_national_map_geom') }}

    UNION ALL
    SELECT
        land_id,
        land_type,
        parent_land_type,
        tolerance,
        geom
    FROM {{ ref('land_national_map_commune_geom') }}
),

compared AS (
    SELECT
        light.land_id,
        light.land_type,
        light.parent_land_type,
        light.tolerance,
        ST_Area(land.geom) AS origin_area,
        ST_Area(light.geom) / ST_Area(land.geom) AS area_ratio
    FROM light
    JOIN {{ ref('land') }} AS land
        ON land.land_id = light.land_id
        AND land.land_type = light.land_type
)

SELECT *
FROM compared
WHERE area_ratio NOT BETWEEN 0.45 AND 2.3
    OR abs(area_ratio - 1) > greatest(
        {{ max_relative_gap }},
        {{ max_gap_in_tolerances }} * tolerance / sqrt(origin_area)
    )
