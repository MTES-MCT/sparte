{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

{% set fields_to_query = """
    from_year,
    to_year,
    total_median,
    total_median_percent,
    total_avg,
    total_percent,
    activite_median,
    activite_median_percent,
    activite_avg,
    activite_percent,
    habitat_median,
    habitat_median_percent,
    habitat_avg,
    habitat_percent,
    mixte_median,
    mixte_median_percent,
    mixte_avg,
    mixte_percent,
    route_median,
    route_median_percent,
    route_avg,
    route_percent,
    ferroviaire_median,
    ferroviaire_median_percent,
    ferroviaire_avg,
    ferroviaire_percent,
    inconnu_median,
    inconnu_median_percent,
    inconnu_avg,
    inconnu_percent
""" %}


SELECT
    'COMMUNE' as relevance_level,
    'EPCI' as land_type,
    epci_stats_commune.epci as land_id,
    {{ fields_to_query }}
FROM
    {{ ref('conso_epci_stats_commune') }} as epci_stats_commune
UNION
SELECT
    'DEPARTEMENT' as relevance_level,
    'REGION' as land_type,
    region_stats_departement.region as land_id,
    {{ fields_to_query }}
FROM
    {{ ref('conso_regional_stats_departement') }} as region_stats_departement
UNION
SELECT
    'EPCI' as relevance_level,
    'NATION' as land_type,
    'NATION' as land_id,
    {{ fields_to_query }}
FROM
    {{ ref('conso_national_stats_epci') }} as national_stats_epci
UNION
SELECT
    'REGION' as relevance_level,
    'NATION' as land_type,
    'NATION' as land_id,
    {{ fields_to_query }}
FROM
    {{ ref('conso_national_stats_region') }} as national_stats_region
UNION
SELECT
    'SCOT' as relevance_level,
    'NATION' as land_type,
    'NATION' as land_id,
    {{ fields_to_query }}
FROM
    {{ ref('conso_national_stats_scot') }} as national_stats_scot
