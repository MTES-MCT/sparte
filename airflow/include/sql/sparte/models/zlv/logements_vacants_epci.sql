{{ config(materialized='table') }}

SELECT
    code_siren as code_epci,
    land_name as epci_name,
    year as year,
    logements_parc_general,
    logements_parc_prive,
    logements_vacants_parc_general,
    logements_vacants_2ans_parc_prive
FROM
    {{ ref('logements_vacants') }}
WHERE
    code_siren in (SELECT code FROM {{ ref('epci') }})
AND not code_insee && array{{ commune_changed_since('2019') }}
AND {{ secretisation_zlv() }} -- On applique la secretisation
