

{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['departement','year'], 'type': 'btree'},
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['uuid'], 'type': 'btree'}
        ],
        post_hook="CREATE INDEX ON {{ this }} USING GIST (geom)"
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
    ST_MakeValid(geom) AS geom
FROM
    {{ source('public', 'ocsge_occupation_du_sol') }} AS ocsge
