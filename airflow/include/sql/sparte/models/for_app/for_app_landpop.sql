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
    {{ fields_to_query }}
FROM
    {{ ref('flux_population_commune') }}
UNION
SELECT
    epci as land_id,
    'EPCI' as land_type,
    {{ fields_to_query }}
FROM
    {{ ref('flux_population_epci') }}
UNION
SELECT
    departement as land_id,
    'DEPARTEMENT' as land_type,
    {{ fields_to_query }}
FROM
    {{ ref('flux_population_departement') }}
UNION
SELECT
    region as land_id,
    'REGION' as land_type,
    {{ fields_to_query }}
FROM
    {{ ref('flux_population_region') }}
UNION
SELECT
    scot as land_id,
    'SCOT' as land_type,
    {{ fields_to_query }}
FROM
    {{ ref('flux_population_scot') }}
