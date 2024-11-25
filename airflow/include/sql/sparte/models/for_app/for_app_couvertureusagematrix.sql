{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    id,
    is_artificial,
    is_impermeable,
    couverture_id,
    usage_id
FROM
    {{ ref('app_couvertureusagematrix') }}
