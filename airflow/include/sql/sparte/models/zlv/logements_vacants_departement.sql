{{ config(materialized='table') }}

SELECT
    departement.code as code_departement,
    land_name as departement_name,
    year as year,
    logements_parc_general,
    logements_parc_prive,
    logements_vacants_parc_general,
    logements_vacants_2ans_parc_prive
FROM
    {{ ref('logements_vacants') }} as logements_vacants
LEFT JOIN
    {{ ref('departement') }} as departement
ON
    replace(land_name, 'Département ', '') = departement.name
OR
    replace(land_name, 'DDT Corrèze', 'Corrèze') = departement.name
OR
    replace(land_name, 'Région Martinique', 'Martinique') = departement.name
OR
    replace(land_name, 'Région Guyane', 'Guyane') = departement.name
WHERE
    logements_vacants.land_type = 'Département'
AND
    land_name != 'CE d''Alsace'
AND
    land_name != 'Département Mayotte'
OR
    land_name = 'DDT Corrèze' AND
    land_type = 'Service Déconcentré Départemental'
OR
    land_name = 'Région Martinique' AND
    land_type = 'Autre'
OR
    land_name = 'Région Guyane' AND
    land_type = 'Autre'
AND
    {{ secretisation_zlv() }} -- On applique la secretisation
