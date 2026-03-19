{{ config(materialized='table') }}

SELECT
    '{{ var("NATION") }}' as nation,
    year as year,
    sum(evolution) as evolution,
    sum(population) as population,
    max(source) as source
FROM
    {{ ref('flux_population_region') }}
GROUP BY
    year
