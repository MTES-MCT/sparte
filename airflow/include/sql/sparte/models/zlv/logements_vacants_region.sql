{{ config(materialized='table') }}

SELECT
    region.code as code_region,
    land_name as region_name,
    year as year,
    logements_parc_general,
    logements_parc_prive,
    logements_vacants_parc_general,
    logements_vacants_2ans_parc_prive
FROM
    {{ ref('logements_vacants') }} as logements_vacants
LEFT JOIN
    {{ ref('region') }} as region
ON
    replace(land_name, 'Région ', '') = region.name
WHERE
    land_type = 'Région'
OR
    land_name = 'Région Martinique' AND
    land_type = 'Autre'
OR
    land_name = 'Région Guyane' AND
    land_type = 'Autre'
OR
    land_name = 'Région Corse' AND
    land_type = 'Autre'
