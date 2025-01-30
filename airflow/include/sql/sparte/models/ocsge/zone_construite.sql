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
with zone_construite as (
    SELECT
        id,
        year,
        departement,
        uuid::uuid,
        2154                      AS srid_source,
        to_timestamp(loaded_date) AS loaded_date,
        st_makevalid(geom)        AS geom,
        st_area(geom)             AS surface,
        row_number() over (partition by
            geom,
            departement,
            year
        ) as rn
    FROM
        {{ source('public', 'ocsge_zone_construite') }}
)
select
    id,
    year,
    departement,
    uuid,
    srid_source,
    loaded_date,
    geom,
    surface
from
    zone_construite
where
    rn = 1
