-- depends_on: {{ source('public', 'ocsge_occupation_du_sol') }}, {{ source('public', 'ocsge_diff') }}, {{ source('public', 'ocsge_zone_construite') }}

{{ config(materialized='incremental') }}

SELECT * FROM
    {{ source('public', 'ocsge_zone_construite') }}
{% if is_incremental() %}
    WHERE guid not in (SELECT guid from {{ this }})
{% endif %}
