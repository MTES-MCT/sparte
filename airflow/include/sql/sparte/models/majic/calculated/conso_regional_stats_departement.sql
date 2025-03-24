{{ config(materialized='table') }}

SELECT
    departement.region,
    conso.from_year,
    conso.to_year,
    percentile_disc(0.5) WITHIN GROUP (ORDER BY (
        CASE
            WHEN pop.evolution = 0
            THEN 0
            ELSE conso.total / pop.evolution
        END
    )) as median_ratio_pop_conso
FROM
    {{ ref('period_consommation_departement') }} as conso
LEFT JOIN
    {{ ref('departement') }} as departement
    ON departement.code = conso.departement
LEFT JOIN
    {{ ref('period_flux_population_departement')}} as pop
    ON conso.departement = pop.departement
    AND conso.from_year = pop.from_year
    AND conso.to_year = pop.to_year
GROUP BY
    departement.region,
    conso.from_year,
    conso.to_year
