{{ config(materialized='table') }}

SELECT
    departement.region,
    from_year,
    to_year,
    {{ sum_percent_median_avg('total', 'departement.surface') }},
    {{ sum_percent_median_avg('activite', 'departement.surface') }},
    {{ sum_percent_median_avg('habitat', 'departement.surface') }},
    {{ sum_percent_median_avg('mixte', 'departement.surface') }},
    {{ sum_percent_median_avg('route', 'departement.surface') }},
    {{ sum_percent_median_avg('ferroviaire', 'departement.surface') }},
    {{ sum_percent_median_avg('inconnu', 'departement.surface') }}
FROM
    {{ ref('period_consommation_departement') }} as conso
LEFT JOIN
    {{ ref('departement') }} as departement
    ON departement.code = conso.departement
GROUP BY
    departement.region,
    from_year,
    to_year
