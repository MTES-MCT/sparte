{{ config(materialized="table") }}

SELECT
    land.land_id as departement_code,
    departement.name as nom,
    departement.region as region_code,
    max(CASE WHEN land.index = 1 THEN array_to_string(land.years, ', ') END) as millesimes_1,
    max(CASE WHEN land.index = 1 THEN land.percent END) as pourcent_imper_1,
    max(CASE WHEN land.index = 1 THEN land.surface END) as surface_imper_1,
    max(CASE WHEN land.index = 2 THEN array_to_string(land.years, ', ') END) as millesimes_2,
    max(CASE WHEN land.index = 2 THEN land.percent END) as pourcent_imper_2,
    max(CASE WHEN land.index = 2 THEN land.surface END) as surface_imper_2,
    max(CASE WHEN land.index = 2 THEN land.flux_surface END) as flux_surface_1_2,
    max(CASE WHEN land.index = 2 THEN land.flux_percent END) as flux_percent_1_2,
    ST_Transform(departement.simple_geom, 4326) as geom
FROM {{ ref("imper_land_by_index") }} as land
LEFT JOIN {{ ref("departement") }} as departement ON land.land_id = departement.code
WHERE land.land_type = '{{ var("DEPARTEMENT") }}'
AND {{ exclude_guyane_incomplete_lands("land.land_id", "DEPARTEMENT") }}
GROUP BY land.land_id, departement.name, departement.region, departement.simple_geom
