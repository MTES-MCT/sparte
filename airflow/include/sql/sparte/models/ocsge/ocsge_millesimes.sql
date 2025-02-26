{{
    config(
        materialized="table",
    )
}}

SELECT DISTINCT departement, year FROM {{ ref('occupation_du_sol') }}
