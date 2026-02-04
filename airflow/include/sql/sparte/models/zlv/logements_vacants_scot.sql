{{ config(materialized='table') }}


SELECT
    scot_communes.id_scot as code_scot,
    max(scot_communes.nom_scot) as scot_name,
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
LEFT JOIN
    {{ ref('scot_communes') }} as scot_communes
ON
    scot_communes.commune_code = logements_vacants_commune.code_commune
WHERE
    scot_communes.id_scot IS NOT NULL
GROUP BY
    scot_communes.id_scot,
    logements_vacants_commune.year
