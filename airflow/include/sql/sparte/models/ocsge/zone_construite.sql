{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['loaded_date'], 'type': 'btree'},
            {'columns': ['departement','year'], 'type': 'btree'},
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['uuid'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ]
    )
}}

SELECT
    to_timestamp(loaded_date) as loaded_date,
    id,
    year,
    departement,
    ST_MakeValid(geom) AS geom,
    ST_Area(geom) as surface,
    uuid::uuid,
    2154 as srid_source
FROM
    {{ source('public', 'ocsge_zone_construite') }} as ocsge
