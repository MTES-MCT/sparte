{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    code AS source_id,
    name AS name,
    ST_Transform(geom, 4326) AS mpoly,
    srid_source AS srid_source
FROM
    {{ ref('region') }}
