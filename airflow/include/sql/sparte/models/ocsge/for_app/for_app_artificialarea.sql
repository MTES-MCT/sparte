{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    commune_year_id,
    year,
    surface / 10000 as surface,
    srid_source,
    departement,
    commune_code as city,
    ST_Transform(geom, 4326) as mpoly
FROM
    {{ ref('artificial_commune') }}
