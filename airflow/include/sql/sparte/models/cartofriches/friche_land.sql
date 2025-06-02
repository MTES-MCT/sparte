{{ config(materialized='table') }}

SELECT
    friche.site_id,
    friche.geom,
    land.land_type AS land_type,
    land.land_id as land_id,
    land.name AS land_name
FROM
    {{ ref('friche') }}
LEFT JOIN
    {{ ref('land') }}
ON
    ST_Intersects(friche.geom, land.geom)
ORDER BY
    site_id
