{{ config(materialized='table') }}

with data_with_proper_code_commune as (
    SELECT
        CASE
            WHEN code_insee[1] = '13201' THEN '13055'
            WHEN code_insee[1] = '69381' THEN '69123'
            ELSE code_insee[1]
        END as code_commune,
        land_name as commune_name,
        year as year,
        logements_parc_general,
        logements_parc_prive,
        logements_vacants_parc_general,
        logements_vacants_2ans_parc_prive
    FROM
        {{ ref('logements_vacants') }}
    WHERE
        land_type = 'Commune' AND
        NOT starts_with(code_insee[1], '976')
        -- On exclut les communes de Mayotte
)
SELECT * FROM data_with_proper_code_commune
WHERE code_commune not in {{ commune_changed_since('2019') }}
