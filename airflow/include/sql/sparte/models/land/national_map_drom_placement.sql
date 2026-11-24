/*
    Placement des cinq régions d'outre-mer près de l'Hexagone, pour la carte nationale.

    Calculé une fois, sur les régions très simplifiées de land_national_map_geom : c'est la
    maille de référence de la carte, la même que celle du fond par région servi par Django.
    Toutes les données déplacées à l'avance (les tuiles de communes de
    for_vector_tiles_communes_national) lisent ce placement au lieu de le recalculer sur
    leurs propres géométries, dont l'emprise diffère de quelques kilomètres : elles se
    superposent ainsi exactement aux fonds des autres mailles.

    Le calcul est dans la macro national_map_drom_placement.
*/

{{
    config(
        materialized='table',
    )
}}

WITH regions AS (
    SELECT
        land_id AS region_code,
        ST_Transform(geom, 3857) AS geom
    FROM {{ ref('land_national_map_geom') }}
    WHERE land_type = '{{ var("REGION") }}'
),

placement AS (
    {{ national_map_drom_placement('regions') }}
)

SELECT
    region_code,
    name,
    scale_factor,
    x_offset,
    y_offset,
    inset_geom,
    slot_geom,
    reference_geom,
    separation_geom
FROM placement
