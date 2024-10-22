{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    code                     AS source_id,
    name,
    srid_source,
    ST_TRANSFORM(geom, 4326) AS mpoly
FROM
    {{ ref('epci') }}
