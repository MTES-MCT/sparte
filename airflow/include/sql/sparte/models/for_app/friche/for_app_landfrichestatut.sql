{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}


SELECT
    land_id,
    land_type,
    friche_statut,
    friche_count,
    friche_surface / 10000 as friche_surface
FROM
    {{ ref('friche_land_by_statut')}}
