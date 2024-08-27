{{
    config(
        materialized='table',
        docs={'node_color': '#D70040'}
    )
}}

SELECT
    id,
    scot_id,
    departement_id
FROM
    {{ source('public', 'app_scot_departements') }}
