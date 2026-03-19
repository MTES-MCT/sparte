{{ config(materialized='table') }}

SELECT
    year,
    'NATION' as code_nation,
    sum(logements_autorises) as logements_autorises,
    sum(logements_commences) as logements_commences,
    sum(surface_de_plancher_autorisee) as surface_de_plancher_autorisee,
    sum(surface_de_plancher_commencee) as surface_de_plancher_commencee
FROM
    {{ ref('logement_region')}} as logement_region
GROUP BY
    year
ORDER BY
    year
