{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

{% set fields_to_query = """
    year,
    population,
    surface,
    density_ha,
    density_km2
""" %}

-- Commune density
SELECT
    code_commune as land_id,
    '{{ var('COMMUNE') }}' as land_type,
    flux.year,
    flux.population,
    commune.surface,
    CASE
        WHEN commune.surface > 0 THEN ROUND((flux.population::numeric / (commune.surface::numeric / 10000)), 2)
        ELSE 0
    END as density_ha,
    CASE
        WHEN commune.surface > 0 THEN ROUND((flux.population::numeric / (commune.surface::numeric / 1000000)), 2)
        ELSE 0
    END as density_km2
FROM
    {{ ref('flux_population_commune') }} as flux
LEFT JOIN
    {{ ref('commune') }} as commune
    ON flux.code_commune = commune.code

UNION ALL

-- EPCI density
SELECT
    epci as land_id,
    '{{ var('EPCI') }}' as land_type,
    flux.year,
    flux.population,
    epci.surface,
    CASE
        WHEN epci.surface > 0 THEN ROUND((flux.population::numeric / (epci.surface::numeric / 10000)), 2)
        ELSE 0
    END as density_ha,
    CASE
        WHEN epci.surface > 0 THEN ROUND((flux.population::numeric / (epci.surface::numeric / 1000000)), 2)
        ELSE 0
    END as density_km2
FROM
    {{ ref('flux_population_epci') }} as flux
LEFT JOIN
    {{ ref('epci') }} as epci
    ON flux.epci = epci.code

UNION ALL

-- Departement density
SELECT
    departement as land_id,
    '{{ var('DEPARTEMENT') }}' as land_type,
    flux.year,
    flux.population,
    departement.surface,
    CASE
        WHEN departement.surface > 0 THEN ROUND((flux.population::numeric / (departement.surface::numeric / 10000)), 2)
        ELSE 0
    END as density_ha,
    CASE
        WHEN departement.surface > 0 THEN ROUND((flux.population::numeric / (departement.surface::numeric / 1000000)), 2)
        ELSE 0
    END as density_km2
FROM
    {{ ref('flux_population_departement') }} as flux
LEFT JOIN
    {{ ref('departement') }} as departement
    ON flux.departement = departement.code

UNION ALL

-- Region density
SELECT
    region as land_id,
    '{{ var('REGION') }}' as land_type,
    flux.year,
    flux.population,
    region.surface,
    CASE
        WHEN region.surface > 0 THEN ROUND((flux.population::numeric / (region.surface::numeric / 10000)), 2)
        ELSE 0
    END as density_ha,
    CASE
        WHEN region.surface > 0 THEN ROUND((flux.population::numeric / (region.surface::numeric / 1000000)), 2)
        ELSE 0
    END as density_km2
FROM
    {{ ref('flux_population_region') }} as flux
LEFT JOIN
    {{ ref('region') }} as region
    ON flux.region = region.code

UNION ALL

-- SCOT density
SELECT
    flux.scot as land_id,
    '{{ var('SCOT') }}' as land_type,
    flux.year,
    flux.population,
    scot.surface,
    CASE
        WHEN scot.surface > 0 THEN ROUND((flux.population::numeric / (scot.surface::numeric / 10000)), 2)
        ELSE 0
    END as density_ha,
    CASE
        WHEN scot.surface > 0 THEN ROUND((flux.population::numeric / (scot.surface::numeric / 1000000)), 2)
        ELSE 0
    END as density_km2
FROM
    {{ ref('flux_population_scot') }} as flux
LEFT JOIN
    {{ ref('scot') }} as scot
    ON flux.scot = scot.id_scot

ORDER BY density_km2 DESC
