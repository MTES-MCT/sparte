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
    'COMMUNE' as land_type,
    'EPCI' as comparison_level,
    commune.epci as comparison_id,
    {{ fields_to_query }}

FROM
    {{ ref('consommation_commune') }}
LEFT JOIN
    {{ ref('commune') }} as commune
    ON commune_code = commune.code
UNION
SELECT
    epci as land_id,
    'EPCI' as land_type,
    'NATION' as comparison_level,
    'NATION' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('consommation_epci') }}
UNION
SELECT
    departement as land_id,
    'DEPARTEMENT' as land_type,
    'REGION' as comparison_level,
    departement.region as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('consommation_departement') }}
LEFT JOIN
    {{ ref('departement') }} as departement
    ON departement.code = consommation_departement.departement
UNION
SELECT
    region as land_id,
    'REGION' as land_type,
    'NATION' as comparison_level,
    'NATION' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('consommation_region') }}
UNION
SELECT
    scot as land_id,
    'SCOT' as land_type,
    'NATION' as comparison_level,
    'NATION' as comparison_id,
    {{ fields_to_query }}
FROM
    {{ ref('consommation_scot') }}
