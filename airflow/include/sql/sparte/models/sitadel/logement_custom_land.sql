{{ config(materialized='table') }}

SELECT
    year,
    clc.custom_land_id as code_custom_land,
    sum(logements_autorises) as logements_autorises,
    sum(logements_commences) as logements_commences,
    sum(surface_de_plancher_autorisee) as surface_de_plancher_autorisee,
    sum(surface_de_plancher_commencee) as surface_de_plancher_commencee
FROM {{ ref('logement_commune') }}
INNER JOIN
    {{ ref('commune_custom_land') }} as clc
ON
    clc.commune_code = code_commune
GROUP BY
    clc.custom_land_id,
    year
ORDER BY
    code_custom_land,
    year
