{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    friche_land.site_id,
    friche_land.land_type,
    friche_land.land_id,
    friche_land.land_name,
    friche.friche_sol_pollution,
    friche.friche_statut,
    friche.friche_is_in_zone_activite,
    friche.friche_zonage_environnemental,
    friche.friche_type_zone,
    friche.friche_type,
    friche.friche_surface_percentile_rank,
    friche.surface,
    st_transform(st_pointonsurface(friche.geom), 4326) AS point_on_surface

FROM
    {{ ref('friche_land') }}
LEFT JOIN
    {{ ref('friche') }}
ON friche_land.site_id = friche.site_id
