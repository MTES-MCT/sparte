{{
    config(
        materialized='table',
        indexes=[
            {"columns": ["site_id"], "type": "btree"},
            {"columns": ["land_id"], "type": "btree"},
            {"columns": ["land_type"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

SELECT
    friche.site_id,
    friche.geom,
    land.land_type AS land_type,
    land.land_id as land_id,
    land.name AS land_name,
    friche.friche_sol_pollution,
    friche.friche_statut,
    friche.friche_is_in_zone_activite,
    friche.friche_zonage_environnemental,
    friche.friche_type_zone,
    friche.friche_type,
    friche.friche_surface_percentile_rank,
    friche.surface
FROM
    {{ ref('friche') }}
LEFT JOIN
    {{ ref('land') }}
ON
    ST_Intersects(friche.geom, land.geom)
ORDER BY
    site_id
