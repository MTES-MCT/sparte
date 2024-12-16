{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
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
FROM {{ ref('app_usagesol') }}
