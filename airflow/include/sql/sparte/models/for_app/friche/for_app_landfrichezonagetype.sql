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
    friche_count,
    friche_surface
FROM
    {{ ref('friche_land_by_zonage_type')}}
