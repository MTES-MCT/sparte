{{ config(materialized='table') }}


SELECT
    scot_communes.id_scot as code_scot,
    max(scot_communes.nom_scot) as scot_name,
    logements_vacants_commune.year as year,
    sum(logements_parc_general) as logements_parc_general,
    sum(logements_parc_prive) as logements_parc_prive,
    sum(logements_vacants_parc_general) as logements_vacants_parc_general,
    sum(logements_vacants_2ans_parc_prive) as logements_vacants_2ans_parc_prive
FROM
    {{ ref('logements_vacants_commune') }} as logements_vacants_commune
LEFT JOIN
    {{ ref('scot_communes') }} as scot_communes
ON
    scot_communes.commune_code = logements_vacants_commune.code_commune
WHERE
    scot_communes.id_scot IS NOT NULL
AND
    {{ secretisation_zlv() }} -- On applique la secretisation
GROUP BY
    scot_communes.id_scot,
    logements_vacants_commune.year
