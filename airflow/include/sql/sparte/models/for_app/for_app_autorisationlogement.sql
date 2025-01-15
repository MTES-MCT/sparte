{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}
with autorisations as (
SELECT
    code_commune as land_id,
    '{{ var('COMMUNE') }}' as land_type,
    year as year,
    logements_autorises,
    logements_commences,
    surface_de_plancher_autorisee,
    surface_de_plancher_commencee
FROM
    {{ ref('logement_commune')}}
UNION
SELECT
    code_epci as land_id,
    '{{ var('EPCI') }}' as land_type,
    year as year,
    logements_autorises,
    logements_commences,
    surface_de_plancher_autorisee,
    surface_de_plancher_commencee
FROM
    {{ ref('logement_epci')}}
UNION
SELECT
    code_departement as land_id,
    '{{ var('DEPARTEMENT') }}' as land_type,
    year as year,
    logements_autorises,
    logements_commences,
    surface_de_plancher_autorisee,
    surface_de_plancher_commencee
FROM
    {{ ref('logement_departement')}}
UNION
SELECT
    code_region as land_id,
    '{{ var('REGION') }}' as land_type,
    year as year,
    logements_autorises,
    logements_commences,
    surface_de_plancher_autorisee,
    surface_de_plancher_commencee
FROM
    {{ ref('logement_region')}}
UNION
SELECT
    code_scot as land_id,
    '{{ var('SCOT') }}' as land_type,
    year as year,
    logements_autorises,
    logements_commences,
    surface_de_plancher_autorisee,
    surface_de_plancher_commencee
FROM
    {{ ref('logement_scot')}}
), with_percentages as (
SELECT
    autorisations.land_id,
    autorisations.land_type,
    autorisations.year,
    autorisations.logements_autorises::int,
    autorisations.logements_commences::int,
    autorisations.surface_de_plancher_autorisee::double precision,
    autorisations.surface_de_plancher_commencee::double precision,
    coalesce(
        autorisations.logements_autorises
         * 100 / NULLIF(logements_vacants.logements_parc_general, 0),
    0)::double precision as percent_autorises_on_parc_general,
    coalesce(
        NULLIF(logements_vacants.logements_vacants_parc_general, 0) * 100 / NULLIF(autorisations.logements_autorises, 0),
    0)::double precision as percent_autorises_on_vacants_parc_general
FROM
    autorisations
LEFT JOIN
    {{ ref('for_app_logementvacant') }} as logements_vacants
ON
    autorisations.land_id = logements_vacants.land_id
    AND autorisations.year = logements_vacants.year
), land_id_without_missing_years as (
    -- On récupère les land_id qui ont des données pour toutes les années
SELECT
    with_percentages.land_type || ' ' || with_percentages.land_id AS land
FROM
    with_percentages
group by
    with_percentages.land_id,
    with_percentages.land_type
HAVING
    array_agg(with_percentages.year) @> array[2019, 2020, 2021, 2022, 2023]
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
ORDER BY
percent_autorises_on_vacants_parc_general DESC
