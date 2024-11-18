{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

{% set fields_to_query = """
    from_year,
    to_year,
    evolution,
    evolution_percent
""" %}

SELECT
    code_commune as land_id,
    'COMMUNE' as land_type,
    'EPCI' as comparison_level,
    commune.epci as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('flux_population_commune') }} as flux_population_commune
LEFT JOIN
    {{ ref('commune') }} as commune
    ON flux_population_commune.code_commune = commune.code
UNION
SELECT
    epci as land_id,
    'EPCI' as land_type,
    'NATION' as comparison_level,
    'NATION' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('flux_population_epci') }}
UNION
SELECT
    departement as land_id,
    'DEPARTEMENT' as land_type,
    'REGION' as comparison_level,
    departement.region as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('flux_population_departement') }} as flux_population_departement
LEFT JOIN
    {{ ref('departement') }} as departement
    ON departement.code = flux_population_departement.departement
UNION
SELECT
    region as land_id,
    'REGION' as land_type,
    'NATION' as comparison_level,
    'NATION' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('flux_population_region') }}
UNION
SELECT
    scot as land_id,
    'SCOT' as land_type,
    'NATION' as comparison_level,
    'NATION' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('flux_population_scot') }}
