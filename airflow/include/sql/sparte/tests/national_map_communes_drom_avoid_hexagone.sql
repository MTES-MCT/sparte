/*
    Dans les tuiles de communes de la carte nationale, aucune commune d'outre-mer déplacée
    n'est dessinée sur l'Hexagone ou la Corse : elle ne recoupe la géométrie d'aucune région
    restée en place. Ce sont les géométries des régions du fond de carte
    (land_national_map_geom) qui sont comparées, pas leur rectangle d'emprise, à l'intérieur
    duquel se trouvent les emplacements des DROM.

    Le test retourne les couples (commune déplacée, région recoupée).
*/

SELECT
    tiles.land_id,
    tiles.name,
    region.land_id AS intersected_region_code
FROM {{ ref('for_vector_tiles_communes_national') }} AS tiles
JOIN {{ ref('national_map_drom_placement') }} AS placement
    ON placement.region_code = tiles."{{ var('REGION') }}"
JOIN {{ ref('land_national_map_geom') }} AS region
    ON region.land_type = '{{ var("REGION") }}'
WHERE
    -- Les régions restées en place sont celles qui n'ont pas de placement
    region.land_id NOT IN (SELECT region_code FROM {{ ref('national_map_drom_placement') }})
    AND ST_Intersects(ST_Transform(tiles.geom, 3857), ST_Transform(region.geom, 3857))
