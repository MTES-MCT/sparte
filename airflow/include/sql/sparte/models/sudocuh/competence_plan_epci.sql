{{ config(materialized='table') }}

SELECT
    epci.code as epci_code,
    CASE
        WHEN code_etat_libelle_bcsi LIKE '%Compétence EPCI' THEN TRUE
        ELSE FALSE
    END AS competence_planification
FROM
    {{ ref('epci') }} as epci
LEFT JOIN
    {{ source('public', 'sudocuh_plan_communal') }} as plan_communal
ON
    epci.code = plan_communal.epci_porteuse_siren::varchar
