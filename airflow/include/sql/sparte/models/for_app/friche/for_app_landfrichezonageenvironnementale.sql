{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    land_id,
    land_type,
    friche_zonage_environnemental,
    {{ common_friche_for_app_fields() }}
FROM
    {{ ref('friche_land_by_zonage_environnemental')}}
