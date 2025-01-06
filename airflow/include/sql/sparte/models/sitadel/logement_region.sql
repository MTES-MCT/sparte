{{ config(materialized='table') }}

SELECT
    year,
    departement.region as code_region,
    sum(logements_autorises) as logements_autorises,
    sum(logements_commences) as logements_commences,
    sum(surface_de_plancher_autorisee) as surface_de_plancher_autorisee,
    sum(surface_de_plancher_commencee) as surface_de_plancher_commencee

FROM
{{ ref('logement_departement')}} as logement_departement
LEFT JOIN
{{ ref('departement') }} as departement
ON
departement.code = logement_departement.code_departement
GROUP BY
departement.region,
year
ORDER BY
code_region
