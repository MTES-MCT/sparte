{{ config(
    materialized='table',
    pre_hook="CREATE INDEX IF NOT EXISTS idx_sudocuh_commune_code_insee ON public.sudocuh_commune (\"Code INSEE \")"
) }}

SELECT
    commune.code as commune_code,
    CASE WHEN sudocuh_commune."Nom commune" = sudocuh_commune."Collectivite porteuse " THEN True ELSE False END as competence_planification
FROM
    {{ ref('commune') }} as commune
INNER JOIN
    {{ source('public', 'sudocuh_commune') }} as sudocuh_commune
ON
    commune.code = sudocuh_commune."Code INSEE "
