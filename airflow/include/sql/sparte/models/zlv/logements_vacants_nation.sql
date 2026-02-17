{{ config(materialized='table') }}

SELECT
    '{{ var('NATION') }}' as code_nation,
    'France' as nation_name,
    year as year,
    sum(logements_parc_prive) as logements_parc_prive,
    sum(logements_vacants_parc_prive) as logements_vacants_parc_prive,
    sum(logements_vacants_2ans_parc_prive) as logements_vacants_2ans_parc_prive,
    bool_or(is_secretise) as is_secretise,
    CASE WHEN bool_or(is_secretise) THEN 'partiellement_secretise' ELSE 'non_secretise' END as secretisation_status
FROM
    {{ ref('logements_vacants') }}
WHERE
    land_type = '{{ var('REGION') }}'
GROUP BY
    year
