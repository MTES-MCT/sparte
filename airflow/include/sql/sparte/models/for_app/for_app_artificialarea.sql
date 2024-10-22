{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    commune_year_id,
    year,
    srid_source,
    departement,
    commune_code             AS city,
    surface / 10000          AS surface,
    ST_TRANSFORM(geom, 4326) AS mpoly
FROM
    {{ ref('artificial_commune') }}
