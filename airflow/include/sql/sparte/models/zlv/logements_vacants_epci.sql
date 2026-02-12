{{ config(materialized='table') }}

SELECT
    commune.epci as code_epci,
    epci.name as epci_name,
    logements_vacants_commune.year as year,
    sum(logements_parc_prive) as logements_parc_prive,
    sum(logements_vacants_parc_prive) as logements_vacants_parc_prive,
    sum(logements_vacants_2ans_parc_prive) as logements_vacants_2ans_parc_prive,
    bool_or(logements_vacants_commune.is_secretise) as is_secretise,
    CASE
        WHEN bool_and(logements_vacants_commune.is_secretise) THEN 'totalement_secretise'
        WHEN bool_or(logements_vacants_commune.is_secretise) THEN 'partiellement_secretise'
        ELSE 'non_secretise'
    END as secretisation_status
FROM
    {{ ref('logements_vacants_commune') }} as logements_vacants_commune
INNER JOIN
    {{ ref('commune') }} as commune
ON
    logements_vacants_commune.code_commune = commune.code
INNER JOIN
    {{ ref('epci') }} as epci
ON
    commune.epci = epci.code
WHERE
    commune.epci IS NOT NULL
GROUP BY
    commune.epci,
    epci.name,
    logements_vacants_commune.year
