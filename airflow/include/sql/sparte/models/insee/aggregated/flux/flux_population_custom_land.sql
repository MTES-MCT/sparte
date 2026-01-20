{{ config(materialized='table') }}

select
    clc.custom_land_id as custom_land_code,
    year as year,
    sum(evolution) as evolution,
    sum(flux_population.population) as population,
    max(source) as source
FROM
    {{ ref('flux_population_commune') }} as flux_population
INNER JOIN
    {{ ref('commune_custom_land') }} as clc
ON
    clc.commune_code = flux_population.code_commune
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY
    clc.custom_land_id,
    year
