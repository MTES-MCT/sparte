{{
    config(
        materialized='table',
        docs={'node_color': '#D70040'}
    )
}}

SELECT
    id,
    source_id,
    name,
    region_id,
    is_artif_ready,
    ocsge_millesimes
FROM
    {{ source('public', 'app_departement') }}
