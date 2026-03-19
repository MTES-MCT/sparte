{{
    config(
        materialized='table',
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
    rpls_commune.total as logements_parc_social,
    rpls_commune.vacants as logements_vacants_parc_social,
    logements_vacants_commune.is_secretise,
    logements_vacants_commune.secretisation_status
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
    rpls_epci.total as logements_parc_social,
    rpls_epci.vacants as logements_vacants_parc_social,
    logements_vacants_epci.is_secretise,
    logements_vacants_epci.secretisation_status
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
    rpls_departement.total as logements_parc_social,
    rpls_departement.vacants as logements_vacants_parc_social,
    logements_vacants_departement.is_secretise,
    logements_vacants_departement.secretisation_status
FROM
    {{ ref('logements_vacants_departement') }} as logements_vacants_departement
LEFT JOIN
    {{ ref('rpls_departement') }} as rpls_departement
ON
    logements_vacants_departement.code_departement = rpls_departement.departement_code
AND
    logements_vacants_departement.year = rpls_departement.year
UNION
-- Région
SELECT
    code_region as land_id,
    '{{ var('REGION') }}' as land_type,
    logements_vacants_region.year as year,
    logements_parc_prive,
    logements_vacants_2ans_parc_prive as logements_vacants_parc_prive,
    rpls_region.total as logements_parc_social,
    rpls_region.vacants as logements_vacants_parc_social,
    logements_vacants_region.is_secretise,
    logements_vacants_region.secretisation_status
FROM
    {{ ref('logements_vacants_region') }} as logements_vacants_region
LEFT JOIN
    {{ ref('rpls_region') }} as rpls_region
ON
    logements_vacants_region.code_region = rpls_region.region_code
AND
    logements_vacants_region.year = rpls_region.year

-- SCOT
UNION
SELECT
    code_scot as land_id,
    '{{ var('SCOT') }}' as land_type,
    logements_vacants_scot.year as year,
    logements_parc_prive,
    logements_vacants_2ans_parc_prive as logements_vacants_parc_prive,
    rpls_scot.total as logements_parc_social,
    rpls_scot.vacants as logements_vacants_parc_social,
    logements_vacants_scot.is_secretise,
    logements_vacants_scot.secretisation_status
FROM
    {{ ref('logements_vacants_scot') }} as logements_vacants_scot
LEFT JOIN
    {{ ref('rpls_scot') }} as rpls_scot
ON
    logements_vacants_scot.code_scot = rpls_scot.scot_code
AND
    logements_vacants_scot.year = rpls_scot.year

-- CUSTOM
UNION
SELECT
    code_custom_land as land_id,
    '{{ var('CUSTOM') }}' as land_type,
    logements_vacants_custom_land.year as year,
    logements_parc_prive,
    logements_vacants_2ans_parc_prive as logements_vacants_parc_prive,
    rpls_custom_land.total as logements_parc_social,
    rpls_custom_land.vacants as logements_vacants_parc_social,
    logements_vacants_custom_land.is_secretise,
    logements_vacants_custom_land.secretisation_status
FROM
    {{ ref('logements_vacants_custom_land') }} as logements_vacants_custom_land
LEFT JOIN
    {{ ref('rpls_custom_land') }} as rpls_custom_land
ON
    logements_vacants_custom_land.code_custom_land = rpls_custom_land.custom_land_code
AND
    logements_vacants_custom_land.year = rpls_custom_land.year

-- Nation
UNION
SELECT
    code_nation as land_id,
    '{{ var('NATION') }}' as land_type,
    logements_vacants_nation.year as year,
    logements_parc_prive,
    logements_vacants_2ans_parc_prive as logements_vacants_parc_prive,
    rpls_nation.total as logements_parc_social,
    rpls_nation.vacants as logements_vacants_parc_social,
    logements_vacants_nation.is_secretise,
    logements_vacants_nation.secretisation_status
FROM
    {{ ref('logements_vacants_nation') }} as logements_vacants_nation
LEFT JOIN
    {{ ref('rpls_nation') }} as rpls_nation
ON
    logements_vacants_nation.year = rpls_nation.year
), with_parc_general as (
SELECT
    *,
    logements_parc_prive + logements_parc_social
        as logements_parc_general,
    logements_vacants_parc_prive + logements_vacants_parc_social
        as logements_vacants_parc_general
FROM
    without_parc_general
), with_percentages as (
SELECT
    land_id,
    land_type,
    year,
    logements_parc_prive::int,
    logements_vacants_parc_prive::int,
    logements_parc_social::int,
    logements_vacants_parc_social::int,
    logements_parc_general::int,
    logements_vacants_parc_general::int,
    is_secretise,
    secretisation_status,
    (logements_vacants_parc_general * 100.0 / NULLIF(logements_parc_general, 0))::double precision as logements_vacants_parc_general_percent,
    (logements_vacants_parc_prive * 100.0 / NULLIF(logements_parc_prive, 0))::double precision as logements_vacants_parc_prive_percent,
    (logements_vacants_parc_social * 100.0 / NULLIF(logements_parc_social, 0))::double precision as logements_vacants_parc_social_percent,
    (logements_vacants_parc_prive * 100.0 / NULLIF(logements_parc_general, 0))::double precision as logements_vacants_parc_prive_on_parc_general_percent,
    (logements_vacants_parc_social * 100.0 / NULLIF(logements_parc_general, 0))::double precision as logements_vacants_parc_social_on_parc_general_percent
FROM
    with_parc_general
), land_id_without_missing_years as (
SELECT
    with_percentages.land_type || ' ' || with_percentages.land_id AS land
FROM
    with_percentages
group by
    with_percentages.land_id,
    with_percentages.land_type
HAVING
    array_agg(with_percentages.year) @> array[2020, 2021, 2022, 2023, 2024]
)
SELECT
    *
FROM
    with_percentages
WHERE
    -- On ne garde que les land_id qui ont des données pour toutes les années
    with_percentages.land_type || ' ' || with_percentages.land_id IN (
        SELECT
            land
        FROM
            land_id_without_missing_years
    )
