{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    uuid,
    id as id_source,
    year as millesime,
    ST_Transform(geom, 4326) as mpoly,
    year,
    surface,
    srid_source,
    departement
FROM
    {{ ref("zone_construite") }}
