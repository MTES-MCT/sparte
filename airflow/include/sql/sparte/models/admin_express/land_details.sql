{{ config(materialized='table') }}

SELECT
    land_id,
    land_type,
    name,
    land.surface,
    geom,
    simple_geom,
    artif.surface as surface_artif,
    artif.percent as percent_artif,
    artif.years as years_artif,
    land_ocsge_status.status as ocsge_status,
    land_ocsge_status.has_ocsge as has_ocsge,
    land_zonages.zonage_count > 0 as has_zonage,
    land_friche.friche_count > 0 as has_friche,
    land.child_land_types,
    land.parent_keys,
    land.departements,
    coalesce(sudocuh.competence_planification, false) as competence_planification,
    CASE
        WHEN array_length(land.departements, 1) = 1
        THEN false
        ELSE true
    END as is_interdepartemental
FROM
    {{ ref('land') }}
LEFT JOIN LATERAL (
    SELECT surface, percent, years
    FROM {{ ref('artif_land_by_index') }}
    WHERE
        artif_land_by_index.land_id = land.land_id AND
        artif_land_by_index.land_type = land.land_type
    ORDER BY index DESC
    limit 1
) artif ON true
LEFT JOIN LATERAL (
    SELECT count(*) as zonage_count
    FROM {{ ref('artif_zonage_land') }}
    WHERE
        artif_zonage_land.land_id = land.land_id AND
        artif_zonage_land.land_type = land.land_type
) land_zonages ON true
LEFT JOIN LATERAL (
    SELECT
        status,
        has_ocsge
    FROM {{ ref('land_ocsge_status') }}
    WHERE
        land_ocsge_status.land_id = land.land_id AND
        land_ocsge_status.land_type = land.land_type
) land_ocsge_status ON true
LEFT JOIN LATERAL (
    SELECT
        count(*) as friche_count
    FROM
        {{ ref('friche_land') }}
    WHERE
        friche_land.land_id = land.land_id AND
        friche_land.land_type = land.land_type
) land_friche ON true
LEFT JOIN LATERAL (
    SELECT
        competence_planification
    FROM {{ ref('competence_plan_land')}}
    WHERE
        competence_plan_land.land_id = land.land_id AND
        competence_plan_land.land_type = land.land_type
    LIMIT 1
)  sudocuh ON true
