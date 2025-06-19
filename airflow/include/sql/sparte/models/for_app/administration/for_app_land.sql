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
    ST_Transform(simple_geom, 4326) as simple_geom,
    {{ m2_to_ha('surface_artif') }} as surface_artif,
    percent_artif,
    years_artif,
    ocsge_status,
    has_ocsge,
    has_zonage,
    has_friche,
    land_millesimes.millesimes as millesimes,
    land_millesimes_by_index.millesimes_by_index as millesimes_by_index,
    land.child_land_types,
    land.parent_keys,
    land.departements,
    is_interdepartemental
FROM
    {{ ref('land_details') }} as land
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
