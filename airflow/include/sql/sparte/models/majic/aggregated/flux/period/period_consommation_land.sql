{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['land_id'], 'type': 'btree'},
            {'columns': ['land_type'], 'type': 'btree'},
            {'columns': ['from_year'], 'type': 'btree'},
            {'columns': ['to_year'], 'type': 'btree'},
            {'columns': ['land_id', 'land_type', 'from_year', 'to_year'], 'type': 'btree'}
        ]
    )
}}

{% set common_fields = '''
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
'''%}

SELECT
    commune_code as land_id,
    '{{ var("COMMUNE") }}' as land_type,
    commune_surface as land_surface,
    {{ common_fields }}
FROM {{ ref('period_consommation_commune') }}
UNION ALL
SELECT
    epci as land_id,
    '{{ var("EPCI") }}' as land_type,
    epci_surface as land_surface,
    {{ common_fields }}
FROM {{ ref('period_consommation_epci') }}
UNION ALL
SELECT
    departement as land_id,
    '{{ var("DEPARTEMENT") }}' as land_type,
    departement_surface as land_surface,
    {{ common_fields }}
FROM {{ ref('period_consommation_departement') }}
UNION ALL
SELECT
    region as land_id,
    '{{ var("REGION") }}' as land_type,
    region_surface as land_surface,
    {{ common_fields }}
FROM {{ ref('period_consommation_region') }}
UNION ALL
SELECT
    scot as land_id,
    '{{ var("SCOT") }}' as land_type,
    scot_surface as land_surface,
    {{ common_fields }}
FROM {{ ref('period_consommation_scot') }}
UNION ALL
SELECT
    custom_land as land_id,
    '{{ var("CUSTOM") }}' as land_type,
    custom_land_surface as land_surface,
    {{ common_fields }}
FROM {{ ref('period_consommation_custom_land') }}
