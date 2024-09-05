

{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['loaded_date'], 'type': 'btree'},
            {'columns': ['departement','year'], 'type': 'btree'},
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['uuid'], 'type': 'btree'},
            {'columns': ['code_cs'], 'type': 'btree'},
            {'columns': ['code_us'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ]
    )
}}

SELECT
    to_timestamp(loaded_date) as loaded_date,
    id,
    code_cs,
    code_us,
    departement,
    year,
    ST_area(geom) AS surface,
    {{ is_impermeable('code_cs') }} as is_impermeable,
    {{ is_artificial('code_cs', 'code_us') }} as is_artificial,
    uuid::uuid,
    ST_MakeValid(geom) AS geom,
    2154 as srid_source
FROM
    {{ source('public', 'ocsge_occupation_du_sol') }} AS ocsge
