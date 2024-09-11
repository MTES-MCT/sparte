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
    id,
    year,
    departement,
    uuid::uuid,
    2154                      AS srid_source,
    to_timestamp(loaded_date) AS loaded_date,
    st_makevalid(geom)        AS geom,
    st_area(geom)             AS surface
FROM
    {{ source('public', 'ocsge_zone_construite') }}
