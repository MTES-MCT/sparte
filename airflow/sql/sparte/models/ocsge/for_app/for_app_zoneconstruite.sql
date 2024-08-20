{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    id as id_source,
    year as millesime,
    ST_Transform(geom, 4326) as mpoly,
    year,
    surface,
    2154 as srid_source,
    departement
FROM
    {{ ref("zone_construite") }}
