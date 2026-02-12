{{ config(materialized="table") }}

SELECT
    land.land_id as commune_code,
    commune.name as nom,
    max(CASE WHEN land.index = 1 THEN array_to_string(land.years, ', ') END) as millesimes_1,
    max(CASE WHEN land.index = 1 THEN land.percent END) as pourcent_artif_1,
    max(CASE WHEN land.index = 1 THEN land.surface END) as surface_artif_1,
    max(CASE WHEN land.index = 2 THEN array_to_string(land.years, ', ') END) as millesimes_2,
    max(CASE WHEN land.index = 2 THEN land.percent END) as pourcent_artif_2,
    max(CASE WHEN land.index = 2 THEN land.surface END) as surface_artif_2,
    max(CASE WHEN land.index = 2 THEN land.flux_surface END) as flux_surface_1_2,
    max(CASE WHEN land.index = 2 THEN land.flux_percent END) as flux_percent_1_2,
    commune.departement as departement_code,
    commune.region as region_code,
    commune.epci as epci_code,
    commune.scot as scot_code,
    commune.surface as commune_surface,
    ST_Transform(commune.simple_geom, 4326) as geom
FROM {{ ref("artif_land_by_index") }} as land
LEFT JOIN {{ ref("commune") }} as commune ON land.land_id = commune.code
WHERE land.land_type = '{{ var("COMMUNE") }}'
AND {{ exclude_guyane_incomplete_lands("land.land_id", "COMMUNE") }}
GROUP BY land.land_id, commune.name, commune.departement, commune.region, commune.epci, commune.scot, commune.surface, commune.simple_geom
