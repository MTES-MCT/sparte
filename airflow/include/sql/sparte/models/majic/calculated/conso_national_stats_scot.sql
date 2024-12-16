{{ config(materialized='table') }}

SELECT
    from_year,
    to_year,
    {{ sum_percent_median_avg('total', 'scot.surface') }},
    {{ sum_percent_median_avg('activite', 'scot.surface') }},
    {{ sum_percent_median_avg('habitat', 'scot.surface') }},
    {{ sum_percent_median_avg('mixte', 'scot.surface') }},
    {{ sum_percent_median_avg('route', 'scot.surface') }},
    {{ sum_percent_median_avg('ferroviaire', 'scot.surface') }},
    {{ sum_percent_median_avg('inconnu', 'scot.surface') }}
FROM
    {{ ref('period_consommation_scot') }} as conso
LEFT JOIN
    {{ ref('scot') }} as scot
    ON scot.id_scot = conso.scot
GROUP BY
    from_year,
    to_year
