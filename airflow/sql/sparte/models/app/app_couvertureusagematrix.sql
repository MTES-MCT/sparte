{{ config(materialized='table') }}

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
