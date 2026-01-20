{{ config(materialized='table') }}

SELECT
    clc.custom_land_id as custom_land_code,
    from_year,
    to_year,
    {{ sum_percent_median_avg('evolution', 'start_population') }},
    sum(start_population) as start_population
FROM
    {{ ref('period_flux_population_commune') }} as population
INNER JOIN
    {{ ref('commune_custom_land') }} as clc
    ON clc.commune_code = population.code_commune
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY
    clc.custom_land_id,
    from_year,
    to_year
