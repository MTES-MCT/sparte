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
), with_percentages as (
SELECT
    autorisations.land_id,
    autorisations.land_type,
    autorisations.year,
    autorisations.logements_autorises,
    autorisations.logements_commences,
    autorisations.surface_de_plancher_autorisee,
    autorisations.surface_de_plancher_commencee,
    coalesce(
        autorisations.logements_autorises
         * 100 / NULLIF(logements_vacants.logements_parc_general, 0),
    0) as percent_autorises_on_parc_general,
    coalesce(
        NULLIF(logements_vacants.logements_vacants_parc_general, 0) * 100 / NULLIF(autorisations.logements_autorises, 0),
    0) as percent_autorises_on_vacants_parc_general
FROM
    autorisations
LEFT JOIN
    {{ ref('for_app_logementvacant') }} as logements_vacants
ON
    autorisations.land_id = logements_vacants.land_id
    AND autorisations.year = logements_vacants.year
)
SELECT
    *
FROM
    with_percentages
ORDER BY
percent_autorises_on_vacants_parc_general DESC
