{{ config(materialized='table') }}

with aggregated as (
    SELECT
        CASE
            WHEN land_id IN ('13201', '13202', '13203', '13204', '13205', '13206', '13207', '13208', '13209', '13210', '13211', '13212', '13213', '13214', '13215', '13216')
            THEN '13055'
            WHEN land_id IN ('69381', '69382', '69383', '69384', '69385', '69386', '69387', '69388', '69389')
            THEN '69123'
            WHEN land_id IN ('75101', '75102', '75103', '75104', '75105', '75106', '75107', '75108', '75109', '75110', '75111', '75112', '75113', '75114', '75115', '75116', '75117', '75118', '75119', '75120')
            THEN '75056'
            ELSE land_id
        END as code_commune,
        CASE
            WHEN land_id IN ('13201', '13202', '13203', '13204', '13205', '13206', '13207', '13208', '13209', '13210', '13211', '13212', '13213', '13214', '13215', '13216')
            THEN 'Marseille'
            WHEN land_id IN ('69381', '69382', '69383', '69384', '69385', '69386', '69387', '69388', '69389')
            THEN 'Lyon'
            WHEN land_id IN ('75101', '75102', '75103', '75104', '75105', '75106', '75107', '75108', '75109', '75110', '75111', '75112', '75113', '75114', '75115', '75116', '75117', '75118', '75119', '75120')
            THEN 'Paris'
            ELSE land_name
        END as commune_name,
        year as year,
        sum(logements_parc_prive) as logements_parc_prive,
        sum(logements_vacants_parc_prive) as logements_vacants_parc_prive,
        sum(logements_vacants_2ans_parc_prive) as logements_vacants_2ans_parc_prive,
        bool_or(is_secretise) as is_secretise,
        bool_and(is_secretise) as all_secretise
    FROM
        {{ ref('logements_vacants') }}
    WHERE
        land_type = '{{ var('COMMUNE') }}'
    GROUP BY
        CASE
            WHEN land_id IN ('13201', '13202', '13203', '13204', '13205', '13206', '13207', '13208', '13209', '13210', '13211', '13212', '13213', '13214', '13215', '13216')
            THEN '13055'
            WHEN land_id IN ('69381', '69382', '69383', '69384', '69385', '69386', '69387', '69388', '69389')
            THEN '69123'
            WHEN land_id IN ('75101', '75102', '75103', '75104', '75105', '75106', '75107', '75108', '75109', '75110', '75111', '75112', '75113', '75114', '75115', '75116', '75117', '75118', '75119', '75120')
            THEN '75056'
            ELSE land_id
        END,
        CASE
            WHEN land_id IN ('13201', '13202', '13203', '13204', '13205', '13206', '13207', '13208', '13209', '13210', '13211', '13212', '13213', '13214', '13215', '13216')
            THEN 'Marseille'
            WHEN land_id IN ('69381', '69382', '69383', '69384', '69385', '69386', '69387', '69388', '69389')
            THEN 'Lyon'
            WHEN land_id IN ('75101', '75102', '75103', '75104', '75105', '75106', '75107', '75108', '75109', '75110', '75111', '75112', '75113', '75114', '75115', '75116', '75117', '75118', '75119', '75120')
            THEN 'Paris'
            ELSE land_name
        END,
        year
)

SELECT
    aggregated.code_commune,
    aggregated.commune_name,
    aggregated.year,
    aggregated.logements_parc_prive,
    aggregated.logements_vacants_parc_prive,
    aggregated.logements_vacants_2ans_parc_prive,
    aggregated.is_secretise,
    CASE
        WHEN aggregated.all_secretise THEN 'totalement_secretise'
        WHEN aggregated.is_secretise THEN 'partiellement_secretise'
        ELSE 'non_secretise'
    END as secretisation_status
FROM aggregated
INNER JOIN {{ ref('commune') }} ON aggregated.code_commune = commune.code
