{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    code_commune as land_id,
    '{{ var('COMMUNE') }}' as land_type,
    year as year,
    logements_parc_general,
    logements_parc_prive,
    logements_vacants_parc_general,
    logements_vacants_2ans_parc_prive
FROM
    {{ ref('logements_vacants_commune') }}
UNION
SELECT
    code_epci as land_id,
    '{{ var('EPCI') }}' as land_type,
    year as year,
    logements_parc_general,
    logements_parc_prive,
    logements_vacants_parc_general,
    logements_vacants_2ans_parc_prive
FROM
    {{ ref('logements_vacants_epci') }}
UNION
SELECT
    code_departement as land_id,
    '{{ var('DEPARTEMENT') }}' as land_type,
    year as year,
    logements_parc_general,
    logements_parc_prive,
    logements_vacants_parc_general,
    logements_vacants_2ans_parc_prive
FROM
    {{ ref('logements_vacants_departement') }}
UNION
SELECT
    code_region as land_id,
    '{{ var('REGION') }}' as land_type,
    year as year,
    logements_parc_general,
    logements_parc_prive,
    logements_vacants_parc_general,
    logements_vacants_2ans_parc_prive
FROM
    {{ ref('logements_vacants_region') }}
