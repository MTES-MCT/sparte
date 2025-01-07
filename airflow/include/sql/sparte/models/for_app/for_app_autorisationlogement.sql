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
