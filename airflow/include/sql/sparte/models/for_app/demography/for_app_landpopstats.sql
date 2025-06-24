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
    '{{ var('COMMUNE') }}' as land_type,
    '{{ var('EPCI') }}' as comparison_level,
    commune.epci as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('period_flux_population_commune') }} as flux_population_commune
LEFT JOIN
    {{ ref('commune') }} as commune
    ON flux_population_commune.code_commune = commune.code
UNION
SELECT
    epci as land_id,
    '{{ var('EPCI') }}' as land_type,
    '{{ var('NATION') }}' as comparison_level,
    '{{ var('NATION') }}' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('period_flux_population_epci') }}
UNION
SELECT
    departement as land_id,
    '{{ var('DEPARTEMENT') }}' as land_type,
    '{{ var('REGION') }}' as comparison_level,
    departement.region as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('period_flux_population_departement') }} as flux_population_departement
LEFT JOIN
    {{ ref('departement') }} as departement
    ON departement.code = flux_population_departement.departement
UNION
SELECT
    region as land_id,
    '{{ var('REGION') }}' as land_type,
    '{{ var('NATION') }}' as comparison_level,
    '{{ var('NATION') }}' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('period_flux_population_region') }}
UNION
SELECT
    scot as land_id,
    '{{ var('SCOT') }}' as land_type,
    '{{ var('NATION') }}' as comparison_level,
    '{{ var('NATION') }}' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('period_flux_population_scot') }}
