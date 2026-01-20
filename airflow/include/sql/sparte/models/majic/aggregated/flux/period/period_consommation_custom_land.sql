{{ config(materialized='table') }}

SELECT
    clc.custom_land_id as custom_land,
    from_year,
    to_year,
    sum(commune.surface) as custom_land_surface,
    {{ sum_percent_median_avg('total', 'commune.surface') }},
    {{ sum_percent_median_avg('activite', 'commune.surface') }},
    {{ sum_percent_median_avg('habitat', 'commune.surface') }},
    {{ sum_percent_median_avg('mixte', 'commune.surface') }},
    {{ sum_percent_median_avg('route', 'commune.surface') }},
    {{ sum_percent_median_avg('ferroviaire', 'commune.surface') }},
    {{ sum_percent_median_avg('inconnu', 'commune.surface') }}
FROM
    {{ ref('period_consommation_commune') }} as consommation
INNER JOIN
    {{ ref('commune_custom_land') }} as clc
    ON clc.commune_code = consommation.commune_code
LEFT JOIN
    {{ ref('commune') }} as commune
    ON commune.code = consommation.commune_code
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY
    clc.custom_land_id,
    from_year,
    to_year
