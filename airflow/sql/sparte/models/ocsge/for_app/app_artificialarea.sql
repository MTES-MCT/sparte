{{ config(materialized='table') }}

SELECT
    year,
    surface / 10000,
    2154 as srid_source,
    departement,
    commune_code as city,
    ST_Transform(geom, 4326) as mpoly
FROM
    {{ ref('artificial_commune') }}
