{{ config(materialized='table') }}

SELECT
    clc.custom_land_id as code_custom_land,
    logements_vacants_commune.year as year,
    sum(logements_parc_general) as logements_parc_general,
    sum(logements_parc_prive) as logements_parc_prive,
    sum(logements_vacants_parc_general) as logements_vacants_parc_general,
    sum(logements_vacants_2ans_parc_prive) as logements_vacants_2ans_parc_prive
FROM
    {{ ref('logements_vacants_commune') }} as logements_vacants_commune
INNER JOIN
    {{ ref('commune_custom_land') }} as clc
ON
    clc.commune_code = logements_vacants_commune.code_commune
GROUP BY
    clc.custom_land_id,
    logements_vacants_commune.year
