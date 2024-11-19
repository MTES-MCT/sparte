{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

{% set fields_to_query = """
    from_year,
    to_year,
    total,
    total_percent,
    activite,
    activite_percent,
    habitat,
    habitat_percent,
    mixte,
    mixte_percent,
    route,
    route_percent,
    ferroviaire,
    ferroviaire_percent,
    inconnu,
    inconnu_percent
""" %}

SELECT
    commune_code as land_id,
    '{{ var('COMMUNE') }}' as land_type,
    CASE
        WHEN commune.epci IS NOT NULL
        THEN '{{ var('EPCI') }}'
        ELSE '{{ var('NATION') }}'
    END as comparison_level,
    CASE
        WHEN commune.epci IS NOT NULL
        THEN commune.epci
        ELSE '{{ var('NATION') }}'
    END as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('period_consommation_commune') }}
LEFT JOIN
    {{ ref('commune') }} as commune
    ON commune_code = commune.code
UNION
SELECT
    epci as land_id,
    '{{ var('EPCI') }}' as land_type,
    '{{ var('NATION') }}' as comparison_level,
    '{{ var('NATION') }}' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('period_consommation_epci') }}
UNION
SELECT
    departement as land_id,
    '{{ var('DEPARTEMENT') }}' as land_type,
    '{{ var('REGION') }}' as comparison_level,
    departement.region as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('period_consommation_departement') }} as consommation_departement
LEFT JOIN
    {{ ref('departement') }} as departement
    ON departement.code = consommation_departement.departement
UNION
SELECT
    region as land_id,
    '{{ var('REGION') }}' as land_type,
    '{{ var('NATION') }}' as comparison_level,
    '{{ var('NATION') }}' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('period_consommation_region') }}
UNION
SELECT
    scot as land_id,
    '{{ var('SCOT') }}' as land_type,
    '{{ var('NATION') }}' as comparison_level,
    '{{ var('NATION') }}' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('period_consommation_scot') }}
