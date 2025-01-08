{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

with without_parc_general as (
-- Commune
SELECT
    code_commune as land_id,
    '{{ var('COMMUNE') }}' as land_type,
    logements_vacants_commune.year as year,
    logements_parc_prive,
    logements_vacants_2ans_parc_prive as logements_vacants_parc_prive,
    coalesce(rpls_commune.total, 0) as logements_parc_social,
    coalesce(rpls_commune.vacants, 0) as logements_vacants_parc_social
FROM
    {{ ref('logements_vacants_commune') }} as logements_vacants_commune
LEFT JOIN
    {{ ref('rpls_commune') }} as rpls_commune
ON
    logements_vacants_commune.code_commune = rpls_commune.commune_code
AND
    logements_vacants_commune.year = rpls_commune.year

UNION

-- EPCI
SELECT
    code_epci as land_id,
    '{{ var('EPCI') }}' as land_type,
    logements_vacants_epci.year as year,
    logements_parc_prive,
    logements_vacants_2ans_parc_prive as logements_vacants_parc_prive,
    coalesce(rpls_epci.total, 0) as logements_parc_social,
    coalesce(rpls_epci.vacants, 0) as logements_vacants_parc_social
FROM
    {{ ref('logements_vacants_epci') }} as logements_vacants_epci
LEFT JOIN
    {{ ref('rpls_epci') }} as rpls_epci
ON
    logements_vacants_epci.code_epci = rpls_epci.epci_code
AND
    logements_vacants_epci.year = rpls_epci.year
UNION

-- Departement
SELECT
    code_departement as land_id,
    '{{ var('DEPARTEMENT') }}' as land_type,
    logements_vacants_departement.year as year,
    logements_parc_prive,
    logements_vacants_2ans_parc_prive as logements_vacants_parc_prive,
    coalesce(rpls_departement.total, 0) as logements_parc_social,
    coalesce(rpls_departement.vacants, 0) as logements_vacants_parc_social
FROM
    {{ ref('logements_vacants_departement') }} as logements_vacants_departement
LEFT JOIN
    {{ ref('rpls_departement') }} as rpls_departement
ON
    logements_vacants_departement.code_departement = rpls_departement.departement_code
AND
    logements_vacants_departement.year = rpls_departement.year
UNION
SELECT
    code_region as land_id,
    '{{ var('REGION') }}' as land_type,
    logements_vacants_region.year as year,
    logements_parc_prive,
    logements_vacants_2ans_parc_prive as logements_vacants_parc_prive,
    coalesce(rpls_region.total, 0) as logements_parc_social,
    coalesce(rpls_region.vacants, 0) as logements_vacants_parc_social
FROM
    {{ ref('logements_vacants_region') }} as logements_vacants_region
LEFT JOIN
    {{ ref('rpls_region') }} as rpls_region
ON
    logements_vacants_region.code_region = rpls_region.region_code
AND
    logements_vacants_region.year = rpls_region.year
), with_parc_general as (
SELECT
    *,
    logements_parc_prive + logements_parc_social
        as logements_parc_general,
    logements_vacants_parc_prive + logements_vacants_parc_social
        as logements_vacants_parc_general
FROM
    without_parc_general
)
SELECT
    *,
    coalesce(
        logements_vacants_parc_general * 100.0 / NULLIF(logements_parc_general, 0),
        0
    ) as logements_vacants_parc_general_percent,
    coalesce(
        logements_vacants_parc_prive * 100.0 / NULLIF(logements_parc_prive, 0),
        0
    ) as logements_vacants_parc_prive_percent,
    coalesce(
        logements_vacants_parc_social * 100.0 / NULLIF(logements_parc_social, 0),
        0
    ) as logements_vacants_parc_social_percent
FROM
    with_parc_general
