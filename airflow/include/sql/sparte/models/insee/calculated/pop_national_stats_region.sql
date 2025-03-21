{{ config(materialized='table') }}

SELECT
    from_year,
    to_year,
    {{ sum_percent_median_avg('evolution', 'start_population') }}
FROM
    {{ ref('period_flux_population_region') }} as pop
GROUP BY
    from_year,
    to_year
