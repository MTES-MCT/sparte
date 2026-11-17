/*
    Aucune région d'outre-mer déplacée n'est dessinée sur l'Hexagone ou la Corse : son
    cartouche ne recoupe la géométrie d'aucune région restée en place.

    La comparaison porte sur les géométries des régions, pas sur leur rectangle d'emprise :
    les emplacements sont définis à l'intérieur de ce rectangle, dans les espaces maritimes
    qui bordent la Bretagne et la côte atlantique.

    Le test retourne les couples (région déplacée, région recoupée).
*/

SELECT
    placement.region_code,
    region.land_id AS intersected_region_code
FROM {{ ref('national_map_drom_placement') }} AS placement
JOIN {{ ref('land_national_map_geom') }} AS region
    ON region.land_type = '{{ var("REGION") }}'
WHERE
    -- Les régions restées en place sont celles qui n'ont pas de placement
    region.land_id NOT IN (SELECT region_code FROM {{ ref('national_map_drom_placement') }})
    AND ST_Intersects(placement.inset_geom, ST_Transform(region.geom, 3857))
