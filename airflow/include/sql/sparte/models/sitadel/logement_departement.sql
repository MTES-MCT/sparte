{{ config(materialized='table') }}

SELECT
    year,
    code_departement,
    logements_autorises,
    logements_commences,
    surface_de_plancher_autorisee,
    surface_de_plancher_commencee
FROM {{ ref('raw_logement_departement') }}
LEFT JOIN
    {{ ref('departement') }} as departement
ON
    departement.code = code_departement
WHERE
    departement.code is not null AND
    year >= 2019 AND
    type_logement = 'Tous Logements'
ORDER BY
    code_departement,
    year
