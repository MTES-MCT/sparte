{{ config(materialized='table') }}

SELECT
    sum(surface),
    commune_code,
    code_cs,
    code_us,
    departement
FROM
    {{ ref('occupation_du_sol_commune') }}
GROUP BY
    commune_code,
    code_cs,
    code_us,
    departement
