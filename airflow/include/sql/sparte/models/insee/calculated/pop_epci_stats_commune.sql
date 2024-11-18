{{ config(materialized='table') }}

SELECT
    epci,
    from_year,
    to_year,
    {{ sum_percent_median_avg('evolution', 'start_population') }}
FROM
    {{ ref('period_flux_population_commune') }} as pop
LEFT JOIN
    {{ ref('commune') }} as commune
    ON commune.code = pop.code_commune
GROUP BY
    commune.epci,
    from_year,
    to_year
