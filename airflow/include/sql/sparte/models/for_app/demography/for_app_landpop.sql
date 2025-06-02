{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

{% set fields_to_query = """
    year,
    evolution,
    population,
    source
""" %}


select
    code_commune as land_id,
    '{{ var('COMMUNE') }}' as land_type,
    {{ fields_to_query }}
from
    {{ ref('flux_population_commune') }}
union
select
    departement as land_id,
    '{{ var('DEPARTEMENT') }}' as land_type,
    {{ fields_to_query }}
from
    {{ ref('flux_population_departement') }}
union
select
    region as land_id,
    '{{ var('REGION') }}' as land_type,
    {{ fields_to_query }}
from
    {{ ref('flux_population_region') }}
union
select
    epci as land_id,
    '{{ var('EPCI') }}' as land_type,
    {{ fields_to_query }}
from
    {{ ref('flux_population_epci') }}
union
select
    scot as land_id,
    '{{ var('SCOT') }}' as land_type,
    {{ fields_to_query }}
from
    {{ ref('flux_population_scot') }}
