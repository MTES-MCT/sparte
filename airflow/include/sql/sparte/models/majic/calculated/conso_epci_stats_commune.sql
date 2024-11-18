{{ config(materialized='table') }}

SELECT
    epci,
    from_year,
    to_year,
    {{ sum_percent_median_avg('total', 'commune.surface') }},
    {{ sum_percent_median_avg('activite', 'commune.surface') }},
    {{ sum_percent_median_avg('habitat', 'commune.surface') }},
    {{ sum_percent_median_avg('mixte', 'commune.surface') }},
    {{ sum_percent_median_avg('route', 'commune.surface') }},
    {{ sum_percent_median_avg('ferroviaire', 'commune.surface') }},
    {{ sum_percent_median_avg('inconnu', 'commune.surface') }}
FROM
    {{ ref('period_consommation_commune') }} as conso
LEFT JOIN
    {{ ref('commune') }} as commune
    ON commune.code = conso.commune_code
GROUP BY
    commune.epci,
    from_year,
    to_year
