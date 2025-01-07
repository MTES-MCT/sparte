{{ config(materialized='table') }}

SELECT
    year,
    code_commune,
    logements_autorises,
    logements_commences,
    surface_de_plancher_autorisee,
    surface_de_plancher_commencee
FROM {{ ref('raw_logement_commune') }}
LEFT JOIN
    {{ ref('commune') }} as commune
ON
    commune.code = code_commune
WHERE
    commune.code is not null AND
    year >= 2019 AND
    code_commune not in {{ commune_changed_since('2019') }} AND
    type_logement = 'Tous Logements'
ORDER BY
    code_commune,
    year
