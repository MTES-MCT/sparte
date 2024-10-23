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
    {{ make_valid_multipolygon('ST_Transform(geom, 4326)') }} as mpoly
FROM
    {{ ref('artificial_commune') }}
