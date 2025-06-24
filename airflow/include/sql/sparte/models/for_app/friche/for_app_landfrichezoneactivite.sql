{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}


SELECT
    land_id,
    land_type,
    friche_is_in_zone_activite,
    {{ common_friche_for_app_fields() }}
FROM
    {{ ref('friche_land_by_zone_activite')}}
