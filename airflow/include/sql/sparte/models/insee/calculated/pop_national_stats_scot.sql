{{ config(materialized='table') }}

SELECT
    from_year,
    to_year,
    {{ sum_percent_median_avg('evolution', 'start_population') }}
FROM
    {{ ref('flux_population_scot') }} as pop
GROUP BY
    from_year,
    to_year
