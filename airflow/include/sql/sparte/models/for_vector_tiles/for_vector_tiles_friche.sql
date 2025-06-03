{{ config(materialized="table") }}

SELECT
    site_id as id,
    site_statut,
    site_nom,
    surface,
    source_nom,
    site_actu_date,
    st_transform(geom, 4326) as geom,
    (SELECT array_agg(land_type || '_' || land_id) FROM {{ ref('friche_land') }} WHERE site_id = friche.site_id) AS land_keys
FROM
    {{ ref('friche') }}
