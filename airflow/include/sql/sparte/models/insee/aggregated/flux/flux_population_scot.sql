{{ config(materialized='table') }}

select
    scot.id_scot as scot,
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
LEFT JOIN
    {{ ref('scot_communes') }} as scot
ON
    commune.code = scot.commune_code

GROUP BY
    scot.id_scot,
    year
