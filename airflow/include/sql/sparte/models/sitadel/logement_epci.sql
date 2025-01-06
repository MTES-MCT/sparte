{{ config(materialized='table') }}

SELECT
    year,
    code_epci,
    logements_autorises,
    logements_commences,
    surface_de_plancher_autorisee,
    surface_de_plancher_commencee
FROM {{ ref('raw_logement_epci') }}
LEFT JOIN
    {{ ref('epci') }} as epci
ON
    epci.code = code_epci
WHERE
    epci.code is not null AND
    year >= 2019 AND
    type_logement = 'Tous Logements'
ORDER BY
    code_epci,
    year
