{{
    config(
        materialized='table',
        post_hook="CREATE INDEX ON {{ this }} USING GIST (geom)"
    )
}}

SELECT
    to_timestamp(loaded_date) as loaded_date,
    id,
    year,
    departement,
    ST_MakeValid(geom) AS geom,
    ST_Area(geom) as surface,
    uuid::uuid
FROM
    {{ source('public', 'ocsge_zone_construite') }} as ocsge
