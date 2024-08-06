-- depends_on: {{ source('public', 'ocsge_occupation_du_sol') }}, {{ source('public', 'ocsge_diff') }}, {{ source('public', 'ocsge_zone_construite') }}


{{
    config(
        materialized='incremental',
        incremental_strategy='delete+insert',
        unique_key=['departement','year'],
        indexes=[
            {'columns': ['departement','year'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ]
    )
}}

SELECT
    *,
    ST_area(geom) AS surface,
    {{ is_impermeable('code_cs') }} as is_impermeable,
    {{ is_artificial('code_cs', 'code_us') }} as is_artificial
FROM
    {{ source('public', 'ocsge_occupation_du_sol') }}

{% if is_incremental() %}
    WHERE guid not in (SELECT guid from {{ this }})
{% endif %}
