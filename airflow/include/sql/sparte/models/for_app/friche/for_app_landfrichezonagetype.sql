{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}


SELECT
    land_id,
    land_type,
    friche_type_zone,
    {{ common_friche_for_app_fields() }}
FROM
    {{ ref('friche_land_by_zonage_type')}}
