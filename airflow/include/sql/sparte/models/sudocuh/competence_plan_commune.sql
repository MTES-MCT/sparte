{{ config(materialized='table') }}

SELECT
    commune.code as commune_code,
    CASE
        WHEN code_etat_libelle_bcsi LIKE '%Compétence commune' THEN TRUE
        ELSE FALSE
    END AS competence_planification
FROM
    {{ ref('commune') }} as commune
LEFT JOIN
    {{ source('public', 'sudocuh_plan_communal') }} as plan_communal
ON
    commune.code = plan_communal.code_insee
