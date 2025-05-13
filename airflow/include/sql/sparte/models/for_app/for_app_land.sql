{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    land_id,
    land_type,
    name,
    {{ m2_to_ha('land.surface') }} as surface,
    'ha' as surface_unit,
    ST_Transform(geom, 4326) as geom,
    {{ m2_to_ha('artif.surface') }} as surface_artif,
    artif.percent as percent_artif,
    artif.years as years_artif,
    CASE
        WHEN land_millesimes.millesimes IS NULL THEN false
        ELSE true
    END as has_ocsge,
    land_zonages.zonage_count > 0 as has_zonage,
    land_millesimes.millesimes as millesimes,
    land_millesimes_by_index.millesimes_by_index as millesimes_by_index,
    land.child_land_types,
    land.parent_land_type,
    land.parent_land_ids,
    land.departements,
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
    SELECt array_agg(jsonb_build_object(
        'departement', land_millesimes.departement,
        'departement_name', land_millesimes.departement_name,
        'year', land_millesimes.year,
        'index', land_millesimes.index
    )) as millesimes
    FROM {{ ref('land_millesimes') }}
    WHERe
        land_millesimes.land_id = land.land_id AND
        land_millesimes.land_type = land.land_type AND
        year is not null
) land_millesimes ON true
LEFT JOIN LATERAL (
    SELECT array_agg(jsonb_build_object(
        'departements', departements,
        'years', years,
        'index', index
    )) as millesimes_by_index FROM (
    SELECT
        land_millesimes.index,
        string_agg(distinct year::text, ' - ') as years,
        string_agg(land_millesimes.departement, ' - ') as departements
    FROM {{ ref('land_millesimes') }}
    WHERe
        land_millesimes.land_id = land.land_id AND
        land_millesimes.land_type = land.land_type AND
        year is not null
    group by index) as foo
) land_millesimes_by_index ON true
LEFT JOIN LATERAL (
    SELECT count(*) as zonage_count
    FROM {{ ref('artif_zonage_land') }}
    WHERE
        artif_zonage_land.land_id = land.land_id AND
        artif_zonage_land.land_type = land.land_type
) land_zonages ON true
