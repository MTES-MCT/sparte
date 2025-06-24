{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    land_id,
    land_type,
    friche_sol_pollution,
    {{ common_friche_for_app_fields() }}
FROM
    {{ ref('friche_land_by_pollution')}}
