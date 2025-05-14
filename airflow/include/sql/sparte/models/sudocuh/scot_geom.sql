{{ config(materialized='table') }}

SELECT
    id_scot,
    ST_Union(commune.geom) AS geom,
    ST_Union(commune.simple_geom) AS simple_geom,
    MAX(commune.srid_source) AS srid_source
FROM {{ ref('scot_communes') }}
LEFT JOIN
    {{ ref('commune') }} as commune
ON
    scot_communes.commune_code = commune.code
GROUP BY id_scot
