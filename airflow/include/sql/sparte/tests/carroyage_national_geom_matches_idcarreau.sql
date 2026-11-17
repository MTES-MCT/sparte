/*
Ce test vérifie que chaque carreau ou bloc du carroyage de la carte nationale est dessiné là
où son identifiant le place. Dans la projection de la grille (EPSG:3035), sa géométrie doit
être le carré de côté `resolution_km` dont le coin sud-ouest a les coordonnées nord et est de
l'identifiant. Ce coin doit en outre tomber sur un multiple du côté : c'est ce qui aligne les
blocs sur la grille d'origine.

Un contrôle de la seule forme (un carré du bon côté, aligné) ne suffirait pas : des blocs
dessinés ailleurs, nord et est intervertis par exemple, le passeraient.

Les tolérances (1 cm et 1 m²) absorbent l'aller-retour entre EPSG:3035 et EPSG:4326.

Le test retourne les carreaux et les blocs mal placés, mal dimensionnés ou mal alignés.
*/

WITH blocs AS MATERIALIZED (
    -- MATERIALIZED : sans lui, la reprojection est recalculée dans chaque condition
    SELECT
        idcarreau,
        resolution_km * 1000 AS cote_m,
        {{ carroyage_national_id_coordinate_km('idcarreau', 'N') }} * 1000 AS nord_m,
        {{ carroyage_national_id_coordinate_km('idcarreau', 'E') }} * 1000 AS est_m,
        ST_Transform(geom, 3035) AS geom_3035
    FROM
        {{ ref('for_vector_tiles_carroyage_national') }}
)

SELECT
    idcarreau
FROM
    blocs
WHERE
    nord_m % cote_m <> 0
    OR est_m % cote_m <> 0
    OR ABS(ST_XMin(geom_3035) - est_m) > 0.01
    OR ABS(ST_YMin(geom_3035) - nord_m) > 0.01
    OR ABS(ST_XMax(geom_3035) - (est_m + cote_m)) > 0.01
    OR ABS(ST_YMax(geom_3035) - (nord_m + cote_m)) > 0.01
    -- Avec une emprise exacte, la surface du carré garantit que la géométrie la remplit
    OR ABS(ST_Area(geom_3035) - cote_m::bigint * cote_m) > 1
