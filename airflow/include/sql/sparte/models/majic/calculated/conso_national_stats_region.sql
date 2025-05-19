{{ config(materialized='table') }}

SELECT
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
    {{ ref('period_consommation_region') }} as conso
LEFT JOIN
    {{ ref('region') }} as region
    ON region.code = conso.region
LEFT JOIN
    {{ ref('period_flux_population_region')}} as pop
    ON conso.region = pop.region
    AND conso.from_year = pop.from_year
    AND conso.to_year = pop.to_year
GROUP BY
    conso.from_year,
    conso.to_year
