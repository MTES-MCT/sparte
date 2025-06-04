{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}


SELECT
    land_id,
    land_type,
    friche_surface_percentile_rank,
    friche_surface_ranks.min_surface / 10000 as rank_min_surface,
    friche_surface_ranks.max_surface / 10000 as rank_max_surface,
    friche_count,
    friche_surface / 10000 as friche_surface
FROM
    {{ ref('friche_land_by_surface')}}
LEFT JOIN
    {{ ref('friche_surface_ranks')}}
ON
    friche_land_by_surface.friche_surface_percentile_rank =
    friche_surface_ranks.rank
