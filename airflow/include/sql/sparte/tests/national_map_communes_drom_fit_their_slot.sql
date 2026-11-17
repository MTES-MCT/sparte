/*
    Dans les tuiles de communes de la carte nationale, chaque commune d'outre-mer tient dans
    l'emplacement de sa région : aucune ne déborde sur l'emplacement d'un autre DROM.

    La comparaison porte sur l'emplacement et non sur le cartouche : le cartouche est
    l'emprise de la région très simplifiée, que les communes, plus détaillées, dépassent de
    quelques kilomètres (Les Saintes en Guadeloupe, par exemple).

    Le test retourne les communes qui sortent de l'emplacement de leur région.
*/

SELECT
    tiles.land_id,
    tiles.name,
    placement.region_code
FROM {{ ref('for_vector_tiles_communes_national') }} AS tiles
JOIN {{ ref('national_map_drom_placement') }} AS placement
    ON placement.region_code = tiles."{{ var('REGION') }}"
WHERE NOT ST_Covers(placement.slot_geom, ST_Transform(tiles.geom, 3857))
