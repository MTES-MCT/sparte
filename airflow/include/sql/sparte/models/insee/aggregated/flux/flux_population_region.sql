{{ config(materialized='table') }}

select
    commune.region,
    year as year,
    sum(evolution) as evolution,
    sum(flux_population.population) as population,
    max(source) as source
FROM
    {{ ref('flux_population_commune') }} as flux_population
LEFT JOIN
    {{ ref('commune') }} as commune
ON
    commune.code = flux_population.code_commune
GROUP BY
    commune.region,
    year
