{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

{% set fields_to_query = """
    from_year,
    to_year,
    evolution_median,
    evolution_median_percent,
    evolution_avg,
    evolution_percent
""" %}


SELECT
    '{{ var('COMMUNE') }}' as relevance_level,
    '{{ var('EPCI') }}' as land_type,
    epci_stats_commune.epci as land_id,
    {{ fields_to_query }}
FROM
    {{ ref('pop_epci_stats_commune') }} as epci_stats_commune
UNION
SELECT
    '{{ var('COMMUNE') }}' as relevance_level,
    '{{ var('NATION') }}' as land_type,
    '{{ var('NATION') }}' as land_id,
    {{ fields_to_query }}
FROM
    {{ ref('pop_national_stats_commune') }} as national_stats_commune
UNION
SELECT
    '{{ var('DEPARTEMENT') }}' as relevance_level,
    '{{ var('REGION') }}' as land_type,
    region_stats_departement.region as land_id,
    {{ fields_to_query }}
FROM
    {{ ref('pop_regional_stats_departement') }} as region_stats_departement
UNION
SELECT
    '{{ var('EPCI') }}' as relevance_level,
    '{{ var('NATION') }}' as land_type,
    '{{ var('NATION') }}' as land_id,
    {{ fields_to_query }}
FROM
    {{ ref('pop_national_stats_epci') }} as national_stats_epci
UNION
SELECT
    '{{ var('REGION') }}' as relevance_level,
    '{{ var('NATION') }}' as land_type,
    '{{ var('NATION') }}' as land_id,
    {{ fields_to_query }}
FROM
    {{ ref('pop_national_stats_region') }} as national_stats_region
UNION
SELECT
    '{{ var('SCOT') }}' as relevance_level,
    '{{ var('NATION') }}' as land_type,
    '{{ var('NATION') }}' as land_id,
    {{ fields_to_query }}
FROM
    {{ ref('pop_national_stats_scot') }} as national_stats_scot
