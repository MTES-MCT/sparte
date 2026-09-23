{{ config(materialized='table') }}

-- Géométrie de chaque SCoT reconstruite par union des géométries communales (admin
-- express), via le rattachement géographique commune -> SCoT (scot_communes). On
-- passe par `commune_sans_scot` (et non `commune`) pour éviter la dépendance
-- circulaire commune -> scot_communes -> commune.

SELECT
    scot_communes.id_scot,
    ST_Union(commune.geom) AS geom,
    ST_Union(commune.simple_geom) AS simple_geom,
    MAX(commune.srid_source) AS srid_source
FROM {{ ref('scot_communes') }}
LEFT JOIN
    {{ ref('commune_sans_scot') }} as commune
ON
    scot_communes.commune_code = commune.code
GROUP BY scot_communes.id_scot
