{{
    config(
        materialized='table',
        docs={'node_color': '#D70040'}
    )
}}

SELECT
    id,
    name
FROM
    {{ source('public', 'app_scot') }}
