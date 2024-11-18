{{ config(materialized='table') }}

SELECT
    commune.region,
    from_year,
    to_year,
    {{ sum_percent_median_avg('evolution', 'start_population') }}
FROM
    {{ ref('flux_population_departement') }} as pop
LEFT JOIN
    {{ ref('commune') }} as commune
    ON commune.departement = pop.departement
GROUP BY
    commune.region,
    from_year,
    to_year
