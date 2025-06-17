{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

with friche_land_4326 as (
    SELECT
        friche_land.site_id as site_id,
        friche_land.land_id,
        friche_land.land_type,
        friche_land.land_name,
        friche_land.friche_sol_pollution,
        friche_land.friche_statut,
        friche_land.friche_is_in_zone_activite,
        friche_land.friche_zonage_environnemental,
        friche_land.friche_type_zone,
        friche_land.friche_type,
        friche_land.friche_surface_percentile_rank,
        friche_land.surface,
        st_transform(geom, 4326) as geom,
        st_transform(st_centroid(geom), 4326) as centroid
    FROM
        {{ ref('friche_land') }}
)
SELECT
    land_id,
    land_type,
    land_name,
    jsonb_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(
            friche_land.*,
            geom_column => 'geom',
            id_column => 'site_id'
        )::json)
    ) as geojson_feature_collection,
    jsonb_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(
            friche_land.*,
            geom_column => 'centroid',
            id_column => 'site_id'
        )::json)
    ) as geojson_centroid_feature_collection
FROM
    friche_land_4326 as friche_land
GROUP BY
    land_id, land_type, land_name
