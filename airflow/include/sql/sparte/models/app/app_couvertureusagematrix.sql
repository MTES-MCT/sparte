{{
    config(
        materialized='table',
        docs={'node_color': '#D70040'}
    )
}}

SELECT
    id,
    is_artificial,
    is_impermeable,
    couverture_id,
    usage_id
    -- is_natural,
    --label,
FROM
    {{ source('public', 'app_couvertureusagematrix') }}
