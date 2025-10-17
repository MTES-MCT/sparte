{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    friche_land.site_id,
    friche_land.site_nom,
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
    friche.nature,
    friche.source_producteur,
    st_transform(st_pointonsurface(friche.geom), 4326) AS point_on_surface,
    details.*

FROM
    {{ ref('friche_land') }}
LEFT JOIN
    {{ ref('friche') }}
ON friche_land.site_id = friche.site_id
LEFt JOIN LATERAL (
    SELECT
        surface_artif / 10000 AS surface_artif,
        percent_artif,
        years_artif,
        surface_imper / 10000 AS surface_imper,
        percent_imper,
        years_imper
    FROM {{ ref('friche_details') }} WHERE site_id = friche.site_id LIMIT 1
) as details on true
ORDER BY surface_artif DESC NULLS LAST
