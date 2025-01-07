{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    commune_code as land_id,
    '{{ var('COMMUNE') }}' as land_type,
    year as year,
    total as logements_parc_social,
    vacants as logements_vacants_3mois_parc_social
FROM
    {{ ref('rpls_commune') }}
UNION
SELECT
    epci_code as land_id,
    '{{ var('EPCI') }}' as land_type,
    year as year,
    total as logements_parc_social,
    vacants as logements_vacants_3mois_parc_social
FROM
    {{ ref('rpls_epci') }}
UNION
SELECT
    departement_code as land_id,
    '{{ var('DEPARTEMENT') }}' as land_type,
    year as year,
    total as logements_parc_social,
    vacants as logements_vacants_3mois_parc_social
FROM
    {{ ref('rpls_departement') }}
UNION
SELECT
    region_code as land_id,
    '{{ var('REGION') }}' as land_type,
    year as year,
    total as logements_parc_social,
    vacants as logements_vacants_3mois_parc_social
FROM
    {{ ref('rpls_region') }}
