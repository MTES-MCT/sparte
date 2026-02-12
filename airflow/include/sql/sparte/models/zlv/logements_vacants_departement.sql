{{ config(materialized='table') }}

SELECT
    land_id as code_departement,
    land_name as departement_name,
    year as year,
    logements_parc_prive,
    logements_vacants_parc_prive,
    logements_vacants_2ans_parc_prive,
    is_secretise,
    CASE WHEN is_secretise THEN 'totalement_secretise' ELSE 'non_secretise' END as secretisation_status
FROM
    {{ ref('logements_vacants') }}
WHERE
    land_type = '{{ var('DEPARTEMENT') }}'
ORDER BY
    code_departement, year
