/*
    Sur la carte nationale, chaque région d'outre-mer déplacée tient dans son emplacement,
    et deux emplacements ne se recouvrent pas : aucun DROM n'est donc dessiné sur un autre.

    Deux emplacements voisins partagent un bord : seul un recouvrement de plus de 1 m² est
    une erreur.

    Le test retourne les cartouches qui débordent et les couples d'emplacements superposés.
*/

SELECT
    region_code,
    NULL AS other_region_code,
    'cartouche hors de son emplacement' AS issue
FROM {{ ref('national_map_drom_placement') }}
WHERE NOT ST_Covers(slot_geom, inset_geom)

UNION ALL

SELECT
    placement.region_code,
    other.region_code AS other_region_code,
    'emplacements superposés' AS issue
FROM {{ ref('national_map_drom_placement') }} AS placement
JOIN {{ ref('national_map_drom_placement') }} AS other
    ON other.region_code > placement.region_code
WHERE ST_Area(ST_Intersection(placement.slot_geom, other.slot_geom)) > 1
