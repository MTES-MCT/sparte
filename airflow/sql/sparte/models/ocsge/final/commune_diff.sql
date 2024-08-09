{{ config(materialized='table') }}

SELECT
    commune_code,
    departement,
    year_old,
    year_new,
    sum(CASE WHEN new_is_impermeable THEN surface ELSE 0 END) AS surface_new_is_impermeable,
    sum(CASE WHEN new_not_impermeable THEN surface ELSE 0 END) AS surface_new_not_impermeable,
    sum(CASE WHEN new_is_artificial THEN surface ELSE 0 END) AS surface_new_is_artificial,
    sum(CASE WHEN new_not_artificial THEN surface ELSE 0 END) AS surface_new_not_artificial
FROM
    {{ ref('difference_commune') }}
GROUP BY
    commune_code,
    departement,
    year_old,
    year_new
