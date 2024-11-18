{{ config(materialized='table') }}

SELECT
    from_year,
    to_year,
    {{ sum_percent_median_avg('total', 'region.surface') }},
    {{ sum_percent_median_avg('activite', 'region.surface') }},
    {{ sum_percent_median_avg('habitat', 'region.surface') }},
    {{ sum_percent_median_avg('mixte', 'region.surface') }},
    {{ sum_percent_median_avg('route', 'region.surface') }},
    {{ sum_percent_median_avg('ferroviaire', 'region.surface') }},
    {{ sum_percent_median_avg('inconnu', 'region.surface') }}
FROM
    {{ ref('period_consommation_region') }} as conso
LEFT JOIN
    {{ ref('region') }} as region
    ON region.code = conso.region
GROUP BY
    from_year,
    to_year
