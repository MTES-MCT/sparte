{{ config(materialized="table") }}

SELECT
    land.land_id as region_code,
    region.name as nom,
    max(CASE WHEN land.index = 1 THEN array_to_string(land.years, ', ') END) as millesimes_1,
    max(CASE WHEN land.index = 1 THEN land.percent END) as pourcent_artif_1,
    max(CASE WHEN land.index = 1 THEN land.surface END) as surface_artif_1,
    max(CASE WHEN land.index = 2 THEN array_to_string(land.years, ', ') END) as millesimes_2,
    max(CASE WHEN land.index = 2 THEN land.percent END) as pourcent_artif_2,
    max(CASE WHEN land.index = 2 THEN land.surface END) as surface_artif_2,
    max(CASE WHEN land.index = 2 THEN land.flux_surface END) as flux_surface_1_2,
    max(CASE WHEN land.index = 2 THEN land.flux_percent END) as flux_percent_1_2,
    ST_Transform(region.simple_geom, 4326) as geom
FROM {{ ref("artif_land_by_index") }} as land
LEFT JOIN {{ ref("region") }} as region ON land.land_id = region.code
WHERE land.land_type = '{{ var("REGION") }}'
AND {{ exclude_guyane_incomplete_lands("land.land_id", "REGION") }}
GROUP BY land.land_id, region.name, region.simple_geom
