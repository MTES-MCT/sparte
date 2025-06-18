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
    ARRAY[
        ST_XMin(ST_Transform(geom, 4326)),
        ST_YMin(ST_Transform(geom, 4326)),
        ST_XMax(ST_Transform(geom, 4326)),
        ST_YMax(ST_Transform(geom, 4326))
    ] as bounds,
    ARRAY[
        ST_XMin(ST_Transform(ST_buffer(geom, 0.2), 4326)),
        ST_YMin(ST_Transform(ST_buffer(geom, 0.2), 4326)),
        ST_XMax(ST_Transform(ST_buffer(geom, 0.2), 4326)),
        ST_YMax(ST_Transform(ST_buffer(geom, 0.2), 4326))
    ] as max_bounds,
    ST_Transform(geom, 4326) as geom,
    ST_Transform(simple_geom, 4326) as simple_geom,
    {{ m2_to_ha('artif.surface') }} as surface_artif,
    artif.percent as percent_artif,
    artif.years as years_artif,
    land_ocsge_status.status as ocsge_status,
    land_ocsge_status.has_ocsge as has_ocsge,
    land_zonages.zonage_count > 0 as has_zonage,
    friche_status.friche_count > 0 as has_friche,
    friche_status.status as friche_status,
    friche_status.status_details as friche_status_details,
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
    status,
    friche_count,
    jsonb_build_object(
        'friche_surface', friche_surface / 10000,
        'friche_sans_projet_surface', friche_sans_projet_surface / 10000,
        'friche_avec_projet_surface', friche_avec_projet_surface / 10000,
        'friche_reconvertie_surface', friche_reconvertie_surface / 10000,
        'friche_count', friche_count,
        'friche_sans_projet_count', friche_sans_projet_count,
        'friche_avec_projet_count', friche_avec_projet_count,
        'friche_reconvertie_count', friche_reconvertie_count
    ) as status_details
    FROM {{ ref('land_friche_status') }}
    WHERE
        land_friche_status.land_id = land.land_id AND
        land_friche_status.land_type = land.land_type

) friche_status ON true
