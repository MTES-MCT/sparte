{{ config(materialized='table') }}

SELECT

    from_year,
    to_year,
    {{ sum_percent_median_avg('total', 'epci.surface') }},
    {{ sum_percent_median_avg('activite', 'epci.surface') }},
    {{ sum_percent_median_avg('habitat', 'epci.surface') }},
    {{ sum_percent_median_avg('mixte', 'epci.surface') }},
    {{ sum_percent_median_avg('route', 'epci.surface') }},
    {{ sum_percent_median_avg('ferroviaire', 'epci.surface') }},
    {{ sum_percent_median_avg('inconnu', 'epci.surface') }}
FROM
    {{ ref('consommation_epci') }} as conso
LEFT JOIN
    {{ ref('epci') }} as epci
    ON epci.code = conso.epci
GROUP BY
    from_year,
    to_year
