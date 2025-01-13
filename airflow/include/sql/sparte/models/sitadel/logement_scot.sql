{{ config(materialized='table') }}

SELECT
    year,
    scot_communes.id_scot as code_scot,
    sum(logements_autorises) as logements_autorises,
    sum(logements_commences) as logements_commences,
    sum(surface_de_plancher_autorisee) as surface_de_plancher_autorisee,
    sum(surface_de_plancher_commencee) as surface_de_plancher_commencee
FROM
{{ ref('logement_commune')}} as logement_commune
LEFT JOIN
{{ ref('scot_communes') }} as scot_communes
ON
logement_commune.code_commune = scot_communes.commune_code
WHERE
scot_communes.id_scot is not null
GROUP BY
scot_communes.id_scot,
year
