{{
    config(
        materialized='table',
        docs={'node_color': '#D70040'}
    )
}}

SELECT
    id,
    code,
    label,
    parent_id,
    code_prefix,
    map_color,
    label_short,
    is_key
FROM
    {{ source('public', 'app_usagesol') }}
