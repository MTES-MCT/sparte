{{ config(materialized='table') }}

SELECT
    zonage_checksum as zone_urba,
    year,
    max(departement),
    ST_Area(ST_Transform(ST_Union(geom), 2154)) as area
FROM
    {{ ref('occupation_du_sol_zonage_urbanisme') }}
WHERE
    is_artificial = true
GROUP BY
    zonage_checksum,
    year
