{{ config(materialized="table") }}

SELECT
    land.land_id as epci_code,
    epci.name as nom,
    max(CASE WHEN land.index = 1 THEN array_to_string(land.years, ', ') END) as millesimes_1,
    max(CASE WHEN land.index = 1 THEN land.percent END) as pourcent_artif_1,
    max(CASE WHEN land.index = 1 THEN land.surface END) as surface_artif_1,
    max(CASE WHEN land.index = 2 THEN array_to_string(land.years, ', ') END) as millesimes_2,
    max(CASE WHEN land.index = 2 THEN land.percent END) as pourcent_artif_2,
    max(CASE WHEN land.index = 2 THEN land.surface END) as surface_artif_2,
    max(CASE WHEN land.index = 2 THEN land.flux_surface END) as flux_surface_1_2,
    max(CASE WHEN land.index = 2 THEN land.flux_percent END) as flux_percent_1_2,
    ST_Transform(epci.simple_geom, 4326) as geom
FROM {{ ref("artif_land_by_index") }} as land
LEFT JOIN {{ ref("epci") }} as epci ON land.land_id = epci.code
WHERE land.land_type = '{{ var("EPCI") }}'
AND {{ exclude_guyane_incomplete_lands("land.land_id", "EPCI") }}
GROUP BY land.land_id, epci.name, epci.simple_geom
