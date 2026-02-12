{{ config(materialized='table') }}

SELECT
    epci.code as epci_code,
    CASE WHEN sudocuh_epci."COMPETENCE PLAN" = 'Oui' THEN True ELSE False END as competence_planification
FROM
    {{ ref('epci') }} as epci
INNER JOIN
    {{ source('public', 'sudocuh_epci') }} as sudocuh_epci
ON
    epci.code = sudocuh_epci."EPCI_SIREN"::varchar
